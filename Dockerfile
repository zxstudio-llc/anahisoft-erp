# Stage 1: Frontend Assets build
# FROM oven/bun:1-slim AS node-builder
# WORKDIR /app
# COPY . .
# RUN bun install --frozen-lockfile
# RUN bun run build

FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY . .
RUN npm ci --silent
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

# Install composer and PHP extensions
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN install-php-extensions \
    pcntl \
    intl \
    pdo_mysql \
    zip \
    bcmath && \
    # Cleanup
    rm -rf /tmp/* /var/cache/apk/*

# Environment configuration
ENV APP_ENV=production \
    APP_DEBUG=false \
    OCTANE_SERVER=frankenphp

# Configure PHP for production
COPY docker/php/production.ini $PHP_INI_DIR/conf.d/
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set up application
WORKDIR /app
COPY --chown=appuser:appgroup . .
COPY --from=node-builder --chown=appuser:appgroup /app/public/build/ ./public/build/

# Install dependencies and optimize
RUN composer install --prefer-dist --optimize-autoloader && \
    php artisan optimize && \
    php artisan view:cache && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan event:cache && \
    # Set proper permissions
    chown -R appuser:appgroup /app && \
    chmod -R 755 storage bootstrap/cache && \
    rm -rf tests node_modules docker .git* && \
    composer clear-cache

USER appuser

# Expose port
EXPOSE 8000

ENTRYPOINT ["php", "artisan", "octane:start", "--host=0.0.0.0"]
