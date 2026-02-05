import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from qdrant_client import QdrantClient
from qdrant_client.http import models

from config import STORAGE_PATH, WEBHOOK_SECRET, QDRANT_HOST
from storage import ensure_storage
from tasks import ocr_and_index

logging.basicConfig(level=logging.INFO)
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
    file_id = payload.get("file_id") or payload.get("fileId")
    owner = payload.get("owner")
    task = ocr_and_index.delay(file_path, file_id, owner)
    return {"status": "queued", "task_id": task.id}


@app.get("/search")
async def search(request: Request, q: str = Query(None)):
    if not q:
        if "text/html" not in request.headers.get("accept", ""):
            return {"results": []}
        return templates.TemplateResponse("index.html", {"request": request, "query": "", "results": []})

    results = []
    try:
        client = QdrantClient(host=QDRANT_HOST, port=6333)
        # Search using scroll with filter for text match
        search_result = client.scroll(
            collection_name="docs",
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="text",
                        match=models.MatchText(text=q)
                    )
                ]
            ),
            limit=10,
            with_payload=True,
        )
        points = search_result[0]

        for hit in points:
            payload = hit.payload
            text = payload.get("text", "")
            lower_text = text.lower()
            lower_query = q.lower()

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
                "score": 1,
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
