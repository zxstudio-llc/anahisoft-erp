# Imagen base PHP con FrankenPHP
FROM dunglas/frankenphp:1.4.0-php8.3-alpine AS base

# Variables de entorno
ENV PHP_INI_DIR=/usr/local/etc/php
WORKDIR /var/www/html

# Instalar dependencias necesarias del sistema
RUN apk add --no-cache \
    bash \
    curl \
    libpq \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    supervisor \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        intl \
        mbstring \
        zip \
        xml \
        opcache

# Copiar configuración de PHP solo si existe production.ini
RUN if [ -f docker/php/production.ini ]; then \
        cp docker/php/production.ini $PHP_INI_DIR/conf.d/; \
        echo "Custom production.ini copied to PHP conf.d"; \
    else \
        echo "No production.ini found, using default PHP configuration"; \
    fi

# Usar php.ini de producción por defecto
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# =========================
# Stage para instalar dependencias PHP
# =========================
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# =========================
# Stage para compilar frontend
# =========================
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# =========================
# Stage final
# =========================
FROM base AS production

WORKDIR /var/www/html

# Copiar dependencias PHP ya instaladas
COPY --from=vendor /app/vendor ./vendor

# Copiar assets compilados del frontend
COPY --from=frontend-builder /app/public ./public

# Copiar el resto del código fuente
COPY . .

# Si existe .env.production, reemplazar .env
RUN if [ -f /var/www/html/.env.production ]; then \
        cp /var/www/html/.env.production /var/www/html/.env; \
        echo ".env.production found and copied to .env"; \
    else \
        echo "No .env.production found, keeping existing .env"; \
    fi

# Configuración de permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Comando por defecto (puedes cambiarlo si usas Octane u otro servidor)
CMD ["php-fpm"]
