FROM nextcloud:fpm-alpine

# Install additional dependencies if required
RUN apk add --no-cache \
    ffmpeg \
    imagemagick

COPY setup-nextcloud.sh /usr/local/bin/setup-nextcloud.sh
RUN chmod +x /usr/local/bin/setup-nextcloud.sh
