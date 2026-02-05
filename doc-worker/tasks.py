import logging
from pathlib import Path

import ocrmypdf
from celery import Celery

from config import OCR_LANGS, REDIS_URL
from storage import (
    DOWNLOADS_DIR,
    OCR_DIR,
    build_metadata,
    create_document_id,
    save_metadata,
)
from webdav import download_file

logger = logging.getLogger(__name__)

celery_app = Celery("doc_worker", broker=REDIS_URL, backend=REDIS_URL)


def _run_ocr(source_path: Path, output_pdf: Path, output_text: Path) -> None:
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    output_text.parent.mkdir(parents=True, exist_ok=True)
    ocrmypdf.ocr(
        source_path,
        output_pdf,
        sidecar=output_text,
        language=OCR_LANGS,
        skip_text=True,
    )


@celery_app.task(name="doc_worker.ocr_and_index")
def ocr_and_index(file_path: str, file_id: str | None = None, owner: str | None = None) -> dict:
    document_id = create_document_id()
    download_path = DOWNLOADS_DIR / f"{document_id}-{Path(file_path).name}"
    logger.info("Downloading %s to %s", file_path, download_path)
    download_file(file_path, download_path)

    ocr_pdf_path = OCR_DIR / f"{document_id}.pdf"
    ocr_text_path = OCR_DIR / f"{document_id}.txt"
    logger.info("Running OCR for %s", download_path)
    _run_ocr(download_path, ocr_pdf_path, ocr_text_path)

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
    logger.info("Saved metadata for %s", document_id)
    return metadata
