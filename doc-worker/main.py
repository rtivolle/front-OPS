import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from qdrant_client import QdrantClient
from qdrant_client.http import models

from config import STORAGE_PATH, WEBHOOK_SECRET, QDRANT_HOST, QDRANT_COLLECTION_NAME, REDIS_URL, NEXTCLOUD_URL, NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD
from storage import ensure_storage, get_storage_stats, get_recent_documents
from tasks import ocr_and_index
from embeddings import generate_vector
from log_setup import setup_logging
import httpx
import redis

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Doc-Worker API")
templates = Jinja2Templates(directory="templates")


@app.on_event("startup")
def startup() -> None:
    Path(STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    ensure_storage()


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "query": "", "results": []})


def _validate_webhook(request: Request) -> None:
    if not WEBHOOK_SECRET:
        return
    provided = request.headers.get("x-doc-worker-secret") or request.headers.get("x-webhook-secret")
    if provided != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


@app.post("/hook/nextcloud")
async def nextcloud_hook(request: Request) -> dict[str, Any]:
    _validate_webhook(request)
    payload = await request.json()
    file_path = payload.get("file_path") or payload.get("path") or payload.get("filePath")
    if not file_path:
        raise HTTPException(status_code=400, detail="file_path is required")

    # Basic MIME/Extension check
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif"}
    ext = Path(file_path).suffix.lower()
    if ext not in allowed_extensions:
        logger.warning("Skipping file with unsupported extension: %s", file_path)
        # We return success to avoid Nextcloud retrying forever
        return {"status": "skipped", "reason": "unsupported_extension"}

    file_id = payload.get("file_id") or payload.get("fileId")
    owner = payload.get("owner")
    task = ocr_and_index.delay(file_path, file_id, owner)
    return {"status": "queued", "task_id": task.id}


@app.get("/health")
async def health() -> dict[str, Any]:
    status = {"status": "ok", "services": {}}
    
    # 1. Redis Check
    try:
        r = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=1)
        r.ping()
        status["services"]["redis"] = "ok"
    except Exception as e:
        status["services"]["redis"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # 2. Qdrant Check
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.get(f"http://{QDRANT_HOST}:6333/collections")
            resp.raise_for_status()
            status["services"]["qdrant"] = "ok"
    except Exception as e:
        status["services"]["qdrant"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # 3. Nextcloud Check (WebDAV Ping)
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.request("PROPFIND", f"{NEXTCLOUD_URL}/remote.php/webdav/", auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD) if NEXTCLOUD_USER else None)
            if resp.status_code // 100 in (2, 4): # 2xx or 401/403 means service is up
                status["services"]["nextcloud"] = "ok"
            else:
                status["services"]["nextcloud"] = f"error: {resp.status_code}"
                status["status"] = "degraded"
    except Exception as e:
        status["services"]["nextcloud"] = f"error: {str(e)}"
        status["status"] = "degraded"

    if status["status"] != "ok":
         raise HTTPException(status_code=503, detail=status)
         
    return status


@app.get("/search")
async def search(request: Request, q: str = Query(None)):
    if not q:
        if "text/html" not in request.headers.get("accept", ""):
            return {"results": []}
        return templates.TemplateResponse("index.html", {"request": request, "query": "", "results": []})

    results = []
    try:
        client = QdrantClient(host=QDRANT_HOST, port=6333)
        
        # 1. Generate query vector
        query_vector = generate_vector(q)
        
        # 2. Search nearest neighbors
        search_result = client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=query_vector,
            limit=10,
            with_payload=True,
        )
        
        for hit in search_result:
            payload = hit.payload
            text = payload.get("text", "")
            lower_text = text.lower()
            lower_query = q.lower()
            
            # Simple highlight fallback
            excerpt = ""
            if lower_query in lower_text:
                idx = lower_text.find(lower_query)
                start = max(idx - 80, 0)
                end = min(idx + 120, len(text))
                excerpt = text[start:end].replace("\n", " ").strip()
                if start > 0: excerpt = "..." + excerpt
                if end < len(text): excerpt = excerpt + "..."
            else:
                excerpt = text[:200].replace("\n", " ").strip() + "..."
            
            results.append({
                "score": hit.score,
                "excerpt": excerpt,
                "nextcloud_link": payload.get("nextcloud_link"),
                "file_name": payload.get("file_name"),
            })
    except Exception as e:
        logger.error("Search failed: %s", e)

    if "text/html" in request.headers.get("accept", ""):
        return templates.TemplateResponse("index.html", {"request": request, "query": q, "results": results})

    return {"query": q, "results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
@app.get("/search/stats")
async def get_stats():
    """Return storage statistics."""
    return get_storage_stats()

@app.get("/search/recent")
async def get_recent():
    """Return recent documents."""
    return get_recent_documents()
