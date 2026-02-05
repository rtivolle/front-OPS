from pathlib import Path

import httpx

from config import NEXTCLOUD_APP_PASSWORD, NEXTCLOUD_URL, NEXTCLOUD_USER


def build_webdav_url(file_path: str) -> str:
    sanitized = file_path.lstrip("/")
    return f"{NEXTCLOUD_URL}/remote.php/dav/files/{NEXTCLOUD_USER}/{sanitized}"


def download_file(file_path: str, destination: Path) -> None:
    if not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        raise RuntimeError("NEXTCLOUD_USER and NEXTCLOUD_APP_PASSWORD must be set.")

    destination.parent.mkdir(parents=True, exist_ok=True)
    url = build_webdav_url(file_path)
    with httpx.stream("GET", url, auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD), timeout=60) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_bytes():
                handle.write(chunk)
