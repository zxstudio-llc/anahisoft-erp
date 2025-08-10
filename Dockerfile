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

# Crear script de inicialización optimizado para Inertia
RUN cat > /usr/local/bin/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Iniciando aplicación Laravel con Inertia..."

# Ejecutar scripts de composer omitidos durante build
echo "📦 Ejecutando scripts de composer..."
composer run-script post-autoload-dump --no-interaction

# Verificar que los assets de Inertia existen
echo "🎨 Verificando assets de Inertia..."
if [ -d "public/build" ]; then
    echo "✅ Assets de frontend encontrados:"
    ls -la public/build/
else
    echo "❌ Error: No se encontraron assets compilados de frontend"
    echo "🔍 Listando contenido de public/:"
    ls -la public/
    exit 1
fi

# Configurar conexión a base de datos con reintentos
echo "🔌 Configurando conexión a base de datos..."
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "🔄 Intento de conexión $attempt/$max_attempts..."
    if php artisan tinker --execute="
        try {
            DB::connection()->getPdo();
            echo 'Conexión exitosa a: ' . config('database.connections.pgsql.host') . ':' . config('database.connections.pgsql.port') . PHP_EOL;
            exit(0);
        } catch (Exception \$e) {
            echo 'Error de conexión: ' . \$e->getMessage() . PHP_EOL;
            exit(1);
        }
    " 2>/dev/null; then
        echo "✅ Base de datos conectada exitosamente!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Error: No se pudo conectar a la base de datos después de $max_attempts intentos"
        echo "🔍 Configuración actual:"
        echo "DB_HOST: $(php artisan tinker --execute='echo env("DB_HOST");' 2>/dev/null || echo 'N/A')"
        echo "DB_PORT: $(php artisan tinker --execute='echo env("DB_PORT");' 2>/dev/null || echo 'N/A')"
        echo "DB_DATABASE: $(php artisan tinker --execute='echo env("DB_DATABASE");' 2>/dev/null || echo 'N/A')"
        exit 1
    fi
    
    sleep 3
    attempt=$((attempt + 1))
done

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones de base de datos..."
php artisan migrate --force

# Limpiar y optimizar cachés
echo "⚡ Optimizando aplicación..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Verificar configuración de Inertia
echo "🔧 Verificando configuración de Inertia..."
php artisan tinker --execute="
    echo 'APP_URL: ' . config('app.url') . PHP_EOL;
    echo 'Asset URL: ' . asset('') . PHP_EOL;
    if (class_exists('Inertia\Inertia')) {
        echo 'Inertia está instalado correctamente' . PHP_EOL;
    } else {
        echo 'Advertencia: Inertia no parece estar disponible' . PHP_EOL;
    }
"

echo "🎉 ¡Aplicación Laravel con Inertia lista!"
echo "🌐 Iniciando servidor Octane en puerto 8000..."
exec php artisan octane:start --host=0.0.0.0 --port=8000 --workers=4 --task-workers=2
EOF

# Hacer ejecutable el script
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar a usuario no privilegiado
USER appuser

# Exponer puerto
EXPOSE 8000

# Punto de entrada
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]