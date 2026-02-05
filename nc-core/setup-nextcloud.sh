#!/bin/sh
set -e

# Wait for Nextcloud to be ready
until [ -f /var/www/html/version.php ]; do
  echo "Waiting for Nextcloud to be installed..."
  sleep 5
done

echo "Nextcloud detected. Starting configuration..."

# Configure Redis
php occ config:system:set redis host --value=redis
php occ config:system:set memcache.local --value="\OC\Memcache\Redis"
php occ config:system:set memcache.locking --value="\OC\Memcache\Redis"
php occ config:system:set filelocking.enabled --value=true --type=boolean

# Disable previews
php occ config:system:set preview_max_x --value=1
php occ config:system:set preview_max_y --value=1

# Enable cron
php occ background:cron

# Create group test
php occ group:add test || true

# Create doc-bot user
if ! php occ user:info doc-bot > /dev/null 2>&1; then
  echo "Creating doc-bot user..."
  if [ -n "$NEXTCLOUD_BOT_PASSWORD" ]; then
    OC_PASS="$NEXTCLOUD_BOT_PASSWORD" php occ user:add --password-from-env --group="test" doc-bot
  else
    echo "Warning: NEXTCLOUD_BOT_PASSWORD not set. doc-bot user creation might fail or use a default."
    OC_PASS="change-me-locally" php occ user:add --password-from-env --group="test" doc-bot
  fi
fi

php occ group:adduser test doc-bot || true

echo "Nextcloud configuration completed."
