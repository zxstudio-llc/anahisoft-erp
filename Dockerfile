# Stage 1: Build frontend assets (React)
FROM node:20-alpine AS frontend

WORKDIR /app

# Cache node_modules
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy frontend files
COPY resources/js ./resources/js
COPY resources/css ./resources/css
COPY vite.config.js tailwind.config.js postcss.config.js ./

# Build assets
RUN npm run build

# Stage 2: Build PHP backend (Laravel)
FROM php:8.3-fpm-alpine AS backend

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    xml \
    intl \
    bcmath \
    opcache \
    zip \
    gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Laravel files
COPY . .

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Stage 3: Production image
FROM php:8.3-fpm-alpine

# Copy PHP extensions and config from backend builder
COPY --from=backend /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=backend /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=backend /var/www/html /var/www/html

# Copy built assets from frontend
COPY --from=frontend /app/public/build /var/www/html/public/build

# Runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libzip \
    icu \
    oniguruma \
    libpng \
    libjpeg-turbo \
    freetype

# Config files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php.ini /usr/local/etc/php/php.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD php artisan health:check || exit 1

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]