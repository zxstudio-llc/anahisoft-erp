# Certificados para Greenter Beta

Este directorio contiene certificados de prueba válidos para usar con Greenter en modo beta.

## Archivos disponibles

- `certificate.pem` - Certificado principal de prueba para Greenter beta
- `../certs/certificate.pem` - Certificado de respaldo

## Configuración para modo beta

Según la documentación oficial de Greenter, para el modo beta debes usar:

### Credenciales de prueba:
- **RUC**: 20000000001
- **Usuario SOL**: MODDATOS
- **Contraseña SOL**: moddatos
- **Usuario completo**: 20000000001MODDATOS (RUC + Usuario)

### Configuración en PHP:

```php
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\See;

$see = new See();
$see->setCertificate(file_get_contents(__DIR__.'/certificate.pem'));
$see->setService(SunatEndpoints::FE_BETA);
$see->setClaveSOL('20000000001', 'MODDATOS', 'moddatos');
```

### URLs de servicios beta:
- **Facturación**: https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService
- **Retenciones**: https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService
- **Guías**: https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-gem-beta/billService

## Notas importantes

1. Estos certificados son **SOLO para pruebas** en el entorno beta de SUNAT
2. **NO usar en producción**
3. Para producción necesitas un certificado digital válido emitido por una entidad certificadora autorizada
4. Los certificados de prueba tienen una validez limitada y pueden necesitar renovación

## Referencias

- [Documentación oficial de Greenter](https://greenter.dev/starter/)
- [Guía de inicio con Greenter](https://greenter.dev/starter/)
- [Repositorio demo de Greenter](https://github.com/thegreenter/demo)