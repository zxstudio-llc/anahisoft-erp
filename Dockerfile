# =========================
# Stage base PHP con FrankenPHP
# =========================
FROM dunglas/frankenphp:1.4.0-php8.3-alpine AS base

ENV PHP_INI_DIR=/usr/local/etc/php
WORKDIR /var/www/html

# Instalar dependencias necesarias
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

# Copiar configuración PHP solo si existe
# (este paso se hace después de COPY del proyecto en el stage final)
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# =========================
# Stage Composer (dependencias PHP)
# =========================
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# =========================
# Stage Node (build frontend)
# =========================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar siempre package.json
COPY package.json ./

# Copiar package-lock.json solo si existe
# Esto NO rompe si falta, porque usamos .dockerignore para permitirlo
# Si no quieres usar .dockerignore, coméntalo y se hará npm install directamente
COPY package-lock.json ./package-lock.json

# Instalar dependencias del sistema necesarias para compilar dependencias nativas de Node
RUN apk add --no-cache python3 make g++ libc6-compat

# Instalar dependencias según disponibilidad del lockfile
RUN if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps; \
    else \
        npm install --legacy-peer-deps; \
    fi

# Copiar el resto del código y compilar
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

# Configurar PHP para producción si existe production.ini
RUN if [ -f docker/php/production.ini ]; then \
        cp docker/php/production.ini $PHP_INI_DIR/conf.d/; \
        echo "Custom production.ini copied to PHP conf.d"; \
    else \
        echo "No production.ini found, using default PHP configuration"; \
    fi

# Si existe .env.production, reemplazar .env
RUN if [ -f /var/www/html/.env.production ]; then \
        cp /var/www/html/.env.production /var/www/html/.env; \
        echo ".env.production found and copied to .env"; \
    else \
        echo "No .env.production found, keeping existing .env"; \
    fi

# Configuración de permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Comando por defecto (puedes cambiarlo por Octane si quieres)
CMD ["php-fpm"]
