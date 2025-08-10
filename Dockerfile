# Stage 1: Frontend Assets build
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Final image
FROM dunglas/frankenphp:1.4.0-php8.3-alpine AS base

# Create required directories with proper permissions
RUN mkdir -p /data/caddy /config/caddy /home/.local/share/caddy && \
    chmod -R 755 /data /config /home/.local && \
    # Add non-root user
    addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -s /bin/sh -D appuser && \
    # Give ownership of Caddy directories
    chown -R appuser:appgroup /data /config /home/.local

# Set Caddy environment variables
ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data

# Install composer and PHP extensions (AGREGADO PostgreSQL)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN install-php-extensions \
    pcntl \
    intl \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    zip \
    bcmath && \
    # Cleanup
    rm -rf /tmp/* /var/cache/apk/*

# Configure PHP for production
COPY docker/php/production.ini $PHP_INI_DIR/conf.d/
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set up application
WORKDIR /app
COPY --chown=appuser:appgroup . .

# Copy production environment file
COPY .env.production .env
COPY --from=frontend-builder --chown=appuser:appgroup /app/public/build/ ./public/build/

# Install dependencies WITHOUT running post-install scripts during build
RUN composer install --prefer-dist --optimize-autoloader --no-scripts && \
    # Set proper permissions
    chown -R appuser:appgroup /app && \
    chmod -R 755 storage bootstrap/cache && \
    rm -rf tests node_modules docker .git* && \
    composer clear-cache

# Create entrypoint script inline
RUN cat > /usr/local/bin/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "Starting Laravel application initialization..."

# Run composer scripts that were skipped during build
echo "Running composer post-autoload-dump..."
composer run-script post-autoload-dump --no-interaction

# Wait for database to be ready (optional, useful for docker-compose)
echo "Waiting for database connection..."
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connected successfully';" || {
    echo "Warning: Could not connect to database immediately, will retry during migration"
}

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear and cache configuration
echo "Optimizing Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Starting Octane server..."
exec php artisan octane:start --host=0.0.0.0 --port=8000
EOF

# Make entrypoint executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser

# Expose port
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]