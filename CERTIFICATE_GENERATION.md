# Generación de Certificados para Greenter (Modo Beta)

Este documento explica cómo generar certificados digitales válidos para usar con Greenter en el entorno beta de SUNAT.

## Requisitos Previos

### Windows
- **OpenSSL**: Descarga e instala desde [Win32/Win64 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
- Asegúrate de que OpenSSL esté en el PATH del sistema

### Linux/macOS
- OpenSSL generalmente viene preinstalado
- Si no está disponible, instálalo usando tu gestor de paquetes:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install openssl
  
  # macOS (con Homebrew)
  brew install openssl
  ```

## Métodos de Generación

### Opción 1: Script Automatizado (Recomendado)

#### Windows (PowerShell)
```powershell
.\generate_certificate.ps1
```

#### Linux/macOS (Bash)
```bash
chmod +x generate_certificate.sh
./generate_certificate.sh
```

### Opción 2: Comandos Manuales

#### Paso 1: Generar la clave privada
```bash
openssl genrsa 2048 > resources/certificates/private.key
```

#### Paso 2: Generar el certificado autofirmado
```bash
openssl req -x509 -days 3600 -new -key resources/certificates/private.key -out resources/certificates/certificate.cer -subj "/C=PE/ST=Lima/L=Lima/O=GREENTER SAC/OU=GREENTER SAC/CN=Greenter"
```

#### Paso 3: Crear certificado en formato PEM
```bash
# Combinar certificado y clave privada
cat resources/certificates/certificate.cer > resources/certificates/certificate.pem
echo "" >> resources/certificates/certificate.pem
cat resources/certificates/private.key >> resources/certificates/certificate.pem
```

## Archivos Generados

Después de ejecutar el script, se crearán los siguientes archivos:

```
resources/
├── certificates/
│   ├── private.key          # Clave privada (2048 bits)
│   ├── certificate.cer      # Certificado en formato CER
│   └── certificate.pem      # Certificado PEM (usado por Greenter)
└── certs/
    └── certificate.pem      # Copia de respaldo
```

## Configuración para Modo Beta

### Credenciales SUNAT Beta
Para el entorno beta de SUNAT, utiliza estas credenciales predeterminadas:

- **RUC**: `20000000001`
- **Usuario SOL**: `MODDATOS`
- **Contraseña SOL**: `moddatos`

### URLs de Servicios Beta
- **Facturación**: `https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService`
- **Consultas**: `https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService`
- **Retenciones**: `https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService`

## Uso con Greenter

El certificado generado (`certificate.pem`) será automáticamente detectado por el sistema:

1. **ElectronicBillingService** buscará el certificado en estas rutas:
   - `resources/certificates/certificate.pem`
   - `resources/certs/certificate.pem`
   - Certificado de respaldo embebido

2. **Configuración automática**: El sistema configurará Greenter con:
   - Certificado PEM generado
   - Credenciales beta predeterminadas
   - URLs de servicios beta

## Validación del Certificado

Para verificar que el certificado fue generado correctamente:

```bash
# Verificar el certificado
openssl x509 -in resources/certificates/certificate.pem -text -noout

# Verificar la clave privada
openssl rsa -in resources/certificates/private.key -check
```

## Características del Certificado

- **Algoritmo**: RSA 2048 bits
- **Validez**: 3600 días (~10 años)
- **Tipo**: Autofirmado
- **Formato**: PEM (compatible con Greenter)
- **Uso**: Solo para pruebas en entorno beta

## Notas Importantes

⚠️ **ADVERTENCIAS**:
- Estos certificados son **SOLO para pruebas** en el entorno beta de SUNAT
- **NO usar en producción** - Para producción necesitas un certificado válido emitido por una CA autorizada
- Los certificados autofirmados no son válidos para el entorno de producción de SUNAT

✅ **Beneficios**:
- Permite probar la funcionalidad completa de facturación electrónica
- Compatible con todos los tipos de comprobantes soportados por Greenter
- Configuración automática sin intervención manual

## Solución de Problemas

### Error: "OpenSSL no encontrado"
- Instala OpenSSL y asegúrate de que esté en el PATH
- En Windows, reinicia la terminal después de la instalación

### Error: "No se puede crear el directorio"
- Verifica los permisos de escritura en el directorio del proyecto
- Ejecuta el script como administrador si es necesario

### Error: "Certificado no válido"
- Regenera el certificado ejecutando el script nuevamente
- Verifica que los archivos no estén corruptos

## Renovación

Para renovar el certificado (recomendado cada año en pruebas):

1. Elimina los archivos existentes:
   ```bash
   rm resources/certificates/*
   rm resources/certs/certificate.pem
   ```

2. Ejecuta nuevamente el script de generación

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd")
**Versión**: 1.0