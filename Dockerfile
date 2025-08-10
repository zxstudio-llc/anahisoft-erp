# Stage 1: Frontend Assets build (usando Node.js + npm)
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copia solo los archivos necesarios para npm install (optimización de caché de Docker)
COPY package.json package-lock.json /app/
RUN npm ci --silent

# Copia el resto y construye los assets de React
COPY resources/ /app/resources/
COPY vite.config.js /app/
RUN npm run build  # Esto generará los assets en /app/public/build/

# Stage 2: Backend (PHP + FrankenPHP)
FROM dunglas/frankenphp:1.4.0-php8.3-alpine AS base

# Configuración de usuario y permisos
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -s /bin/sh -D appuser && \
    mkdir -p /data/caddy /config/caddy /home/.local/share/caddy && \
    chown -R appuser:appgroup /data /config /home/.local

# Variables de entorno de Caddy
ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data

# Instalar Composer y extensiones PHP
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN install-php-extensions pcntl intl pdo_mysql zip bcmath && \
    rm -rf /tmp/* /var/cache/apk/*

# Configuración de PHP para producción
ENV APP_ENV=production \
    APP_DEBUG=false \
    OCTANE_SERVER=frankenphp
COPY docker/php/production.ini $PHP_INI_DIR/conf.d/
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copia el código de Laravel e instala dependencias
WORKDIR /app
COPY --chown=appuser:appgroup . .

# Copia los assets construidos desde la etapa frontend-builder
COPY --from=frontend-builder --chown=appuser:appgroup /app/public/build/ ./public/build/

# Optimiza Laravel y limpia archivos innecesarios
RUN composer install --no-dev --optimize-autoloader && \
    php artisan optimize && \
    php artisan view:cache && \
    php artisan config:cache && \
    php artisan route:cache && \
    chmod -R 755 storage bootstrap/cache && \
    rm -rf tests node_modules docker .git*

USER appuser
EXPOSE 8000
ENTRYPOINT ["php", "artisan", "octane:start", "--host=0.0.0.0"]