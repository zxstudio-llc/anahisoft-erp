# Configuración de Culqi

Este documento describe los pasos necesarios para configurar Culqi como método de pago en la aplicación.

## 1. Crear una cuenta en Culqi

1. Ve a [https://culqi.com/](https://culqi.com/)
2. Haz clic en "Regístrate"
3. Completa el formulario con la información de tu empresa
4. Verifica tu correo electrónico

## 2. Configuración en el Panel de Culqi

### 2.1 Obtener Credenciales

1. Inicia sesión en tu [Panel de Culqi](https://panel.culqi.com/)
2. Ve a "Desarrollo" > "API Keys"
3. Aquí encontrarás:
   - Llave Pública (pk_test_...)
   - Llave Privada (sk_test_...)

### 2.2 Configurar Webhook

1. En el Panel de Culqi, ve a "Desarrollo" > "Webhooks"
2. Haz clic en "Agregar Webhook"
3. Configura los siguientes eventos:
   - `charge.succeeded`
   - `charge.failed`
4. URL del webhook: `https://tu-dominio.com/payment/webhook`
5. Guarda la configuración

### 2.3 Personalizar Checkout

1. Ve a "Configuración" > "Checkout"
2. Personaliza:
   - Logo de tu empresa
   - Colores del formulario
   - Mensaje de confirmación
   - Correos de notificación

## 3. Configuración en la Aplicación

### 3.1 Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
CULQI_PUBLIC_KEY=pk_test_...
CULQI_PRIVATE_KEY=sk_test_...
CULQI_RETURN_URL="${APP_URL}/payment/success"
```

### 3.2 Configuración de CORS

Asegúrate de que tu archivo `config/cors.php` permita las solicitudes desde los dominios de Culqi:

```php
return [
    'paths' => ['api/*', 'payment/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://checkout.culqi.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

## 4. Pruebas

### 4.1 Tarjetas de Prueba

Usa estas tarjetas para realizar pruebas en el ambiente de desarrollo:

| Marca | Número | CVV | Fecha Exp. | Resultado |
|-------|---------|-----|------------|-----------|
| Visa | 4111 1111 1111 1111 | 123 | 12/25 | Éxito |
| Mastercard | 5111 1111 1111 1111 | 123 | 12/25 | Éxito |
| Amex | 3712 121212 12122 | 1234 | 12/25 | Éxito |
| Diners | 3600 121212 1210 | 123 | 12/25 | Éxito |
| Visa | 4000 0000 0000 0002 | 123 | 12/25 | Denegada |

### 4.2 Flujo de Prueba

1. Selecciona un plan de suscripción
2. Usa una tarjeta de prueba
3. Verifica que:
   - El pago se procese correctamente
   - El webhook se reciba
   - La suscripción se active
   - Los correos se envíen

## 5. Producción

### 5.1 Requisitos para Producción

Para pasar a producción, necesitarás:

1. Completar el formulario de afiliación
2. Proporcionar documentos legales:
   - RUC activo
   - Ficha RUC
   - DNI del representante legal
   - Documento bancario
3. Pasar la validación de Culqi

### 5.2 Cambios para Producción

1. Actualiza las llaves en `.env`:
   ```env
   CULQI_PUBLIC_KEY=pk_live_...
   CULQI_PRIVATE_KEY=sk_live_...
   ```

2. Verifica la URL del webhook en producción
3. Realiza una prueba de pago real

## 6. Monitoreo

### 6.1 Panel de Culqi

- Monitorea las transacciones en tiempo real
- Revisa los reportes diarios/mensuales
- Configura alertas de transacciones

### 6.2 Logs de la Aplicación

Los logs de pagos se encuentran en:
- `storage/logs/laravel.log`
- Panel de Culqi > Transacciones

## 7. Soporte

- Soporte Culqi: [https://soporte.culqi.com](https://soporte.culqi.com)
- Documentación API: [https://docs.culqi.com](https://docs.culqi.com)
- Comunidad Culqi: [https://comunidad.culqi.com](https://comunidad.culqi.com) 