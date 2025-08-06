# 🚀 Configuración del Sistema WebSocket para Bloqueo de Inquilinos

## ❌ Problema Identificado

El sistema WebSocket no funciona porque la configuración de broadcasting no está correcta.

## ✅ Solución - Pasos para Configurar

### 1. Configurar Variables de Entorno

Copia tu archivo `.env.example` a `.env` si no lo has hecho:
```bash
cp .env.example .env
```

Asegúrate de que tu archivo `.env` tenga estas configuraciones:

```env
# Broadcasting Configuration
BROADCAST_CONNECTION=reverb

# Reverb WebSocket Configuration
REVERB_APP_ID=local
REVERB_APP_KEY=local-key
REVERB_APP_SECRET=local-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Vite Reverb Configuration (for frontend)
VITE_REVERB_APP_KEY="local-key"
VITE_REVERB_HOST="localhost"
VITE_REVERB_PORT="8080"
VITE_REVERB_SCHEME="http"
```

### 2. Instalar y Iniciar Laravel Reverb

```bash
# Instalar Reverb si no está instalado
composer require laravel/reverb

# Publicar configuración
php artisan reverb:install

# Iniciar el servidor Reverb
php artisan reverb:start
```

### 3. Compilar Assets del Frontend

```bash
# Instalar dependencias
npm install

# Compilar en modo desarrollo
npm run dev

# O compilar para producción
npm run build
```

### 4. Verificar que Todo Funciona

#### En el Backend:
1. Revisa los logs en `storage/logs/laravel.log`
2. Busca mensajes como: `StatusTenant event created`

#### En el Frontend:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Console
3. Busca mensajes como: `🔔 TenantStatusChanged event received`
4. Verifica el estado de conexión: `📡 Echo connection status`

### 5. Probar el Sistema

1. **Como Admin**: Ve a la lista de inquilinos y bloquea/activa uno
2. **Como Inquilino**: Deberías ver:
   - Una notificación toast
   - Redirección automática si fue bloqueado
   - Recarga de página si fue activado

## 🔧 Debugging

### Si no funciona, verifica:

1. **Servidor Reverb corriendo**:
   ```bash
   php artisan reverb:start
   ```

2. **Variables de entorno correctas**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Assets compilados**:
   ```bash
   npm run dev
   ```

4. **Logs del sistema**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Comandos de Diagnóstico

```bash
# Verificar configuración de broadcasting
php artisan tinker
>>> config('broadcasting.default')
>>> config('broadcasting.connections.reverb')

# Probar evento manualmente
>>> event(new \App\Events\StatusTenant('test-id', false, 'Test message'));
```

## 🎯 Flujo Completo Esperado

1. Admin hace clic en "Bloquear Inquilino"
2. Se ejecuta `PaymentController::toggleActive()`
3. Se emite evento `StatusTenant` vía Reverb
4. Frontend recibe evento en `TenantStatusListener`
5. Se muestra notificación y se redirige al inquilino
6. Middleware `CheckSubscription` bloquea acceso futuro

## 📞 Si Sigues Teniendo Problemas

1. Verifica que el puerto 8080 esté libre
2. Revisa los logs de Reverb en la terminal
3. Asegúrate de que no hay firewall bloqueando el puerto
4. En producción, configura HTTPS correctamente