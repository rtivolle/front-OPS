import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request

from config import STORAGE_PATH, WEBHOOK_SECRET
from storage import ensure_storage, load_metadata, read_ocr_text
from tasks import ocr_and_index

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Doc-Worker API")


@app.on_event("startup")
def startup() -> None:
    Path(STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    ensure_storage()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Doc-Worker is running"}


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
async def search(query: str) -> dict[str, Any]:
    if not query:
        raise HTTPException(status_code=400, detail="query is required")
    results = []
    for metadata in load_metadata():
        text = read_ocr_text(metadata.get("ocr_text_path"))
        lower_text = text.lower()
        lower_query = query.lower()
        if lower_query in lower_text:
            start = max(lower_text.find(lower_query) - 40, 0)
            end = min(start + 200, len(text))
            excerpt = text[start:end].replace("\n", " ").strip()
            score = lower_text.count(lower_query)
            results.append(
                {
                    "score": score,
                    "excerpt": excerpt,
                    "nextcloud_link": metadata.get("nextcloud_link"),
                    "file_name": metadata.get("file_name"),
                }
            )
    results.sort(key=lambda item: item["score"], reverse=True)
    return {"query": query, "results": results[:10]}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
