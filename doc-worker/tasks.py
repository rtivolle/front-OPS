import logging
import uuid
from pathlib import Path

import magic
import ocrmypdf
from celery import Celery
from qdrant_client import QdrantClient
from qdrant_client.http import models

from config import OCR_LANGS, QDRANT_HOST, REDIS_URL
from storage import (
    DOWNLOADS_DIR,
    OCR_DIR,
    build_metadata,
    save_metadata,
)
from webdav import download_file

logger = logging.getLogger(__name__)

celery_app = Celery("doc_worker", broker=REDIS_URL, backend=REDIS_URL)


def get_qdrant_client():
    return QdrantClient(host=QDRANT_HOST, port=6333)


def init_qdrant():
    try:
        client = get_qdrant_client()
        collections = client.get_collections().collections
        exists = any(c.name == "docs" for c in collections)
        if not exists:
            logger.info("Creating Qdrant collection 'docs'")
            client.create_collection(
                collection_name="docs",
                vectors_config={},  # No vectors for now, just payload search
            )
            client.create_payload_index(
                collection_name="docs",
                field_name="text",
                field_schema=models.TextIndexParams(
                    type="text",
                    tokenizer=models.TokenizerType.MULTILINGUAL,
                    lowercase=True,
                ),
            )
    except Exception as e:
        logger.error("Failed to initialize Qdrant: %s", e)


def _run_ocr(source_path: Path, output_pdf: Path, output_text: Path) -> None:
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    output_text.parent.mkdir(parents=True, exist_ok=True)

    mime = magic.from_file(str(source_path), mime=True)
    logger.info("MIME type for %s: %s", source_path, mime)

    kwargs = {}
    if mime.startswith("image/"):
        kwargs["image_dpi"] = 300

    ocrmypdf.ocr(
        source_path,
        output_pdf,
        sidecar=output_text,
        language=OCR_LANGS,
        skip_text=True,
        **kwargs
    )


@celery_app.task(name="doc_worker.ocr_and_index")
def ocr_and_index(file_path: str, file_id: str | None = None, owner: str | None = None) -> dict:
    init_qdrant()
    document_id = str(uuid.uuid4())
    download_path = DOWNLOADS_DIR / f"{document_id}-{Path(file_path).name}"
    logger.info("Downloading %s to %s", file_path, download_path)
    download_file(file_path, download_path)

    ocr_pdf_path = OCR_DIR / f"{document_id}.pdf"
    ocr_text_path = OCR_DIR / f"{document_id}.txt"
    logger.info("Running OCR for %s", download_path)
    try:
        _run_ocr(download_path, ocr_pdf_path, ocr_text_path)
    except Exception as e:
        logger.error("OCR failed: %s", e)
        # Still try to index metadata even if OCR fails
        pass

    text_content = ""
    if ocr_text_path.exists():
        text_content = ocr_text_path.read_text(encoding="utf-8")

    metadata = build_metadata(
        document_id=document_id,
        file_path=file_path,
        file_id=file_id,
        owner=owner,
        downloaded_path=download_path,
        ocr_pdf_path=ocr_pdf_path,
        ocr_text_path=ocr_text_path,
    )
    save_metadata(document_id, metadata)

    # Index in Qdrant
    try:
        client = get_qdrant_client()
        client.upsert(
            collection_name="docs",
            points=[
                models.PointStruct(
                    id=document_id,
                    vector={},
                    payload={
                        "text": text_content,
                        "file_name": metadata["file_name"],
                        "nextcloud_link": metadata["nextcloud_link"],
                        "owner": owner,
                        "file_path": file_path,
                    },
                )
            ],
        )
        logger.info("Indexed document %s in Qdrant", document_id)
    except Exception as e:
        logger.error("Failed to index in Qdrant: %s", e)

    return metadata
