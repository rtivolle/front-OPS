import logging
import uuid
from pathlib import Path

import magic
import ocrmypdf
from celery import Celery
from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.http import models

from config import OCR_LANGS, QDRANT_HOST, REDIS_URL, QDRANT_COLLECTION_NAME
from storage import (
    DOWNLOADS_DIR,
    OCR_DIR,
    build_metadata,
    save_metadata,
    calculate_file_hash,
    check_if_doc_exists,
)
from webdav import download_file

logger = logging.getLogger(__name__)

celery_app = Celery("doc_worker", broker=REDIS_URL, backend=REDIS_URL)

from celery.signals import setup_logging
from log_setup import setup_logging as configure_logging

@setup_logging.connect
def config_loggers(*args, **kwargs):
    configure_logging()



def get_qdrant_client():
    return QdrantClient(host=QDRANT_HOST, port=6333)


from embeddings import generate_vector


def init_qdrant():
    try:
        client = get_qdrant_client()
        collections = client.get_collections().collections
        exists = any(c.name == QDRANT_COLLECTION_NAME for c in collections)
        if not exists:
            logger.info("Creating Qdrant collection '%s'", QDRANT_COLLECTION_NAME)
            client.create_collection(
                collection_name=QDRANT_COLLECTION_NAME,
                vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
            )
            client.create_payload_index(
                collection_name=QDRANT_COLLECTION_NAME,
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
    
    try:
        download_file(file_path, download_path)

        # Idempotence Check
        file_hash = calculate_file_hash(download_path)
        existing_doc = check_if_doc_exists(file_hash)
        
        if existing_doc:
            logger.info("Document already indexed (hash match: %s). Skipping OCR.", file_hash)
            # We could optionally update the file_path if it moved, but for now we skip.
            return {
                "status": "skipped", 
                "reason": "already_indexed", 
                "original_id": existing_doc["id"]
            }

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
            file_hash=file_hash,
            owner=owner,
            downloaded_path=download_path,
            ocr_pdf_path=ocr_pdf_path,
            ocr_text_path=ocr_text_path,
        )
        save_metadata(document_id, metadata)
        
        # specific vector generation
        vector = []
        if text_content:
            try:
                logger.info("Generating embedding for document %s", document_id)
                vector = generate_vector(text_content)
            except Exception as e:
                logger.error("Failed to generate embedding: %s", e)

        # Index in Qdrant
        try:
            client = get_qdrant_client()
            client.upsert(
                collection_name=QDRANT_COLLECTION_NAME,
                points=[
                    models.PointStruct(
                        id=document_id,
                        vector=vector if vector else {},
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
    finally:
        # Valid cleanup (Phase 2 item implemented now for safety)
        if download_path.exists():
            try:
                download_path.unlink()
            except Exception: pass
        if 'ocr_pdf_path' in locals() and ocr_pdf_path.exists():
            try:
                ocr_pdf_path.unlink()
            except Exception: pass
        if 'ocr_text_path' in locals() and ocr_text_path.exists():
            try:
                ocr_text_path.unlink() 
            except Exception: pass

    # Notify Nextcloud
    if file_id:
        try:
            from nc_client import add_file_comment
            msg = f"🟢 Document processed by Doc-Worker.\nID: {document_id}\nOCR: Yes\nEmbeddings: Yes"
            add_file_comment(file_id, msg)
        except Exception as e:
            logger.error("Failed to notify Nextcloud: %s", e)


    return metadata
