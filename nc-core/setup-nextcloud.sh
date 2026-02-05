#!/bin/sh
set -e

echo "Configuring Nextcloud..."

# Wait for Nextcloud to be ready
# In a real script, we would wait for the database and the web server
# But here we just run the commands

# Configure Redis
docker exec -u www-data nc-core php occ config:system:set redis host --value="redis"
docker exec -u www-data nc-core php occ config:system:set memcache.local --value="\\OC\\Memcache\\Redis"
docker exec -u www-data nc-core php occ config:system:set memcache.locking --value="\\OC\\Memcache\\Redis"

# Disable previews
docker exec -u www-data nc-core php occ config:system:set enable_previews --value=false --type=bool

# Create group and user
docker exec -u www-data nc-core php occ group:add test || true
export OC_PASS=doc-bot-password
docker exec -u www-data -e OC_PASS nc-core php occ user:add --group="test" --password-from-env doc-bot || true

echo "Nextcloud configuration completed."
