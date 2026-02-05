import logging
import httpx
from config import NEXTCLOUD_URL, NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD

logger = logging.getLogger(__name__)

def add_file_comment(file_id: str, message: str) -> bool:
    """
    Adds a comment to a file in Nextcloud.
    """
    if not file_id or not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        return False
        
    try:
        url = f"{NEXTCLOUD_URL}/ocs/v2.php/apps/comments/api/v1/files/{file_id}"
        auth = (NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD)
        headers = {"OCS-APIRequest": "true", "Content-Type": "application/json"}
        
        with httpx.Client(timeout=10) as client:
            resp = client.post(url, json={"message": message}, auth=auth, headers=headers)
            if resp.status_code in (200, 201):
                return True
            logger.error("Failed to add comment to file %s: %s %s", file_id, resp.status_code, resp.text)
    except Exception as e:
        logger.error("Exception adding comment to file %s: %s", file_id, e)
        
    return False
