import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import NEXTCLOUD_URL, STORAGE_PATH

STORAGE_ROOT = Path(STORAGE_PATH)
DOWNLOADS_DIR = STORAGE_ROOT / "downloads"
OCR_DIR = STORAGE_ROOT / "ocr"
META_DIR = STORAGE_ROOT / "meta"
DB_PATH = STORAGE_ROOT / "doc_worker.db"


def ensure_storage() -> None:
    for folder in (DOWNLOADS_DIR, OCR_DIR, META_DIR):
        folder.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                file_id TEXT,
                file_path TEXT NOT NULL,
                file_name TEXT NOT NULL,
                owner TEXT,
                downloaded_path TEXT NOT NULL,
                ocr_pdf_path TEXT,
                ocr_text_path TEXT,
                created_at TEXT NOT NULL,
                nextcloud_link TEXT NOT NULL
            )
            """
        )


def create_document_id() -> str:
    return uuid.uuid4().hex


def build_metadata(
    *,
    document_id: str,
    file_path: str,
    file_id: str | None,
    owner: str | None,
    downloaded_path: Path,
    ocr_pdf_path: Path | None,
    ocr_text_path: Path | None,
) -> dict[str, Any]:
    directory = "/" + "/".join(file_path.strip("/").split("/")[:-1])
    file_name = file_path.strip("/").split("/")[-1]
    return {
        "id": document_id,
        "file_id": file_id,
        "file_path": file_path,
        "file_name": file_name,
        "owner": owner,
        "downloaded_path": str(downloaded_path),
        "ocr_pdf_path": str(ocr_pdf_path) if ocr_pdf_path else None,
        "ocr_text_path": str(ocr_text_path) if ocr_text_path else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "nextcloud_link": f"{NEXTCLOUD_URL}/apps/files/?dir={directory}",
    }


def save_metadata(document_id: str, metadata: dict[str, Any]) -> Path:
    ensure_storage()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO documents (
                id,
                file_id,
                file_path,
                file_name,
                owner,
                downloaded_path,
                ocr_pdf_path,
                ocr_text_path,
                created_at,
                nextcloud_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                metadata["id"],
                metadata.get("file_id"),
                metadata["file_path"],
                metadata["file_name"],
                metadata.get("owner"),
                metadata["downloaded_path"],
                metadata.get("ocr_pdf_path"),
                metadata.get("ocr_text_path"),
                metadata["created_at"],
                metadata["nextcloud_link"],
            ),
        )
    return DB_PATH


def load_metadata() -> list[dict[str, Any]]:
    ensure_storage()
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            """
            SELECT
                id,
                file_id,
                file_path,
                file_name,
                owner,
                downloaded_path,
                ocr_pdf_path,
                ocr_text_path,
                created_at,
                nextcloud_link
            FROM documents
            """
        ).fetchall()
    return [
        {
            "id": row[0],
            "file_id": row[1],
            "file_path": row[2],
            "file_name": row[3],
            "owner": row[4],
            "downloaded_path": row[5],
            "ocr_pdf_path": row[6],
            "ocr_text_path": row[7],
            "created_at": row[8],
            "nextcloud_link": row[9],
        }
        for row in rows
    ]


def read_ocr_text(text_path: str | None) -> str:
    if not text_path:
        return ""
    path = Path(text_path)
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")
