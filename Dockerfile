# Stage 1: Frontend Assets build para Inertia
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Instalar npm más reciente
RUN npm install -g npm@latest

# Copiar archivos de configuración PRIMERO
COPY package.json ./
COPY package-lock.json* ./
COPY vite.config.js* ./
COPY tailwind.config.js* ./
COPY postcss.config.js* ./

# Limpiar cache de npm
RUN npm cache clean --force

# Estrategia mejorada para instalación de dependencias
RUN if [ -f "package-lock.json" ]; then \
        echo "📦 Usando npm ci con package-lock.json existente..." && \
        npm ci --legacy-peer-deps --no-audit --no-fund; \
    else \
        echo "📦 No existe package-lock.json, usando npm install..." && \
        npm install --legacy-peer-deps --no-audit --no-fund; \
    fi || \
    (echo "❌ Primer intento falló, limpiando e intentando nuevamente..." && \
     rm -rf node_modules package-lock.json && \
     npm install --legacy-peer-deps --no-audit --no-fund)

# Copiar código fuente completo DESPUÉS de instalar dependencias
COPY . .

# Construir assets para producción
RUN npm run build

# Verificar que el build fue exitoso
RUN ls -la public/build/ || echo "Build directory not found, checking for dist/" && ls -la dist/ || echo "No build output found"

# Stage 2: Aplicación Laravel con FrankenPHP
FROM dunglas/frankenphp:1.4.0-php8.3-alpine AS base

# Crear directorios y usuario
RUN mkdir -p /data/caddy /config/caddy /home/.local/share/caddy && \
    chmod -R 755 /data /config /home/.local && \
    addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -h /app -s /bin/sh -D appuser && \
    chown -R appuser:appgroup /data /config /home/.local

# Variables de entorno de Caddy
ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data

# Instalar Composer y extensiones PHP necesarias
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN install-php-extensions \
    pcntl \
    intl \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    zip \
    bcmath \
    redis \
    opcache && \
    rm -rf /tmp/* /var/cache/apk/*

# Configurar PHP para producción
COPY docker/php/production.ini $PHP_INI_DIR/conf.d/ || echo "No production.ini found, using defaults"
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Configurar directorio de trabajo
WORKDIR /app

# Copiar código de la aplicación
COPY --chown=appuser:appgroup . .

# Copiar archivo de configuración de producción
COPY .env.production .env

# Copiar assets compilados del frontend
COPY --from=frontend-builder --chown=appuser:appgroup /app/public/build ./public/build
COPY --from=frontend-builder --chown=appuser:appgroup /app/public/hot ./public/hot 2>/dev/null || true

# Instalar dependencias de PHP sin scripts durante build
ENV DOCKER_BUILD=true
RUN composer install --prefer-dist --optimize-autoloader --no-scripts --no-dev && \
    composer dump-autoload --optimize --classmap-authoritative && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 storage bootstrap/cache && \
    # Crear directorios necesarios para Laravel
    mkdir -p storage/logs storage/framework/sessions storage/framework/views storage/framework/cache && \
    chmod -R 775 storage && \
    rm -rf tests node_modules docker .git* .npm && \
    composer clear-cache

# Crear script de inicialización de manera más simple
RUN echo '#!/bin/sh' > /usr/local/bin/docker-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🚀 Iniciando aplicación Laravel con Inertia..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Ejecutar scripts de composer omitidos durante build' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "📦 Ejecutando scripts de composer..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'composer run-script post-autoload-dump --no-interaction' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Verificar que los assets de Inertia existen' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🎨 Verificando assets de Inertia..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ -d "public/build" ]; then' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    echo "✅ Assets de frontend encontrados:"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    ls -la public/build/' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'else' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    echo "❌ Error: No se encontraron assets compilados de frontend"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    echo "🔍 Listando contenido de public/:"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    ls -la public/' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '    exit 1' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Ejecutar migraciones' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🗄️  Ejecutando migraciones de base de datos..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan migrate --force' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Limpiar y optimizar cachés' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "⚡ Optimizando aplicación..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan optimize:clear' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan config:cache' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan route:cache' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan view:cache' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'php artisan event:cache' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🎉 ¡Aplicación Laravel con Inertia lista!"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🌐 Iniciando servidor Octane en puerto 8000..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'exec php artisan octane:start --host=0.0.0.0 --port=8000 --workers=4 --task-workers=2' >> /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# El script ya se hizo ejecutable en el paso anterior

# Cambiar a usuario no privilegiado
USER appuser

# Exponer puerto
EXPOSE 8000

# Punto de entrada
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]