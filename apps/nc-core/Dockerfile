FROM nextcloud:apache

# Install additional dependencies if needed
RUN apt-get update && apt-get install -y     libmagickwand-dev --no-install-recommends     && rm -rf /var/lib/apt/lists/*

# Set some recommended PHP settings
RUN {     echo 'opcache.enable=1';     echo 'opcache.interned_strings_buffer=8';     echo 'opcache.max_accelerated_files=10000';     echo 'opcache.memory_consumption=128';     echo 'opcache.save_comments=1';     echo 'opcache.revalidate_freq=1';     } > /usr/local/etc/php/conf.d/opcache-recommended.ini
