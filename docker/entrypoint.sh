#!/bin/sh
set -e

echo "Starting Laravel application initialization..."

# Run composer scripts that were skipped during build
echo "Running composer post-autoload-dump..."
composer run-script post-autoload-dump --no-interaction

# Wait for database to be ready with retry logic
echo "Waiting for database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Database connection attempt $attempt/$max_attempts..."
    if php artisan tinker --execute="DB::connection()->getPdo(); echo 'Connected';" 2>/dev/null; then
        echo "Database connected successfully!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Failed to connect to database after $max_attempts attempts"
        exit 1
    fi
    
    sleep 2
    attempt=$((attempt + 1))
done

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed database if needed (uncomment if you have seeders)
# echo "Running database seeders..."
# php artisan db:seed --force

# Clear and cache configuration
echo "Optimizing Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Laravel application ready!"
echo "Starting Octane server on port 8000..."
exec php artisan octane:start --host=0.0.0.0 --port=8000