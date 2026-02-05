import os


def get_env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value or ""


REDIS_URL = get_env("REDIS_URL", "redis://redis:6379/0")
NEXTCLOUD_URL = get_env("NEXTCLOUD_URL", "http://web")
NEXTCLOUD_USER = get_env("NEXTCLOUD_USER", "")
NEXTCLOUD_APP_PASSWORD = get_env("NEXTCLOUD_APP_PASSWORD", "")
WEBHOOK_SECRET = get_env("WEBHOOK_SECRET", "")
STORAGE_PATH = get_env("STORAGE_PATH", "/data")
OCR_LANGS = get_env("OCR_LANGS", "fra+eng")
QDRANT_HOST = get_env("QDRANT_HOST", "qdrant")
