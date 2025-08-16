# Configuración de OpenSSL en Windows

Esta guía te ayudará a configurar OpenSSL en tu sistema Windows para poder generar certificados para Greenter.

## Paso 1: Verificar la Instalación de OpenSSL

Primero, verifica dónde se instaló OpenSSL. Las ubicaciones más comunes son:

- `C:\Program Files\OpenSSL-Win64\bin\`
- `C:\Program Files (x86)\OpenSSL-Win32\bin\`
- `C:\OpenSSL-Win64\bin\`
- `C:\OpenSSL-Win32\bin\`

## Paso 2: Agregar OpenSSL al PATH

### Método 1: Interfaz Gráfica (Recomendado)

1. **Abrir Variables de Entorno**:
   - Presiona `Win + R`
   - Escribe `sysdm.cpl` y presiona Enter
   - Ve a la pestaña "Opciones avanzadas"
   - Haz clic en "Variables de entorno"

2. **Editar la Variable PATH**:
   - En "Variables del sistema", busca y selecciona "Path"
   - Haz clic en "Editar"
   - Haz clic en "Nuevo"
   - Agrega la ruta donde está instalado OpenSSL (ejemplo: `C:\Program Files\OpenSSL-Win64\bin`)
   - Haz clic en "Aceptar" en todas las ventanas

3. **Reiniciar la Terminal**:
   - Cierra todas las ventanas de PowerShell/CMD abiertas
   - Abre una nueva ventana de PowerShell

### Método 2: PowerShell (Temporal)

Si quieres una solución rápida solo para la sesión actual:

```powershell
# Agregar OpenSSL al PATH temporalmente
$env:PATH += ";C:\Program Files\OpenSSL-Win64\bin"

# Verificar que funciona
openssl version
```

### Método 3: PowerShell (Permanente)

```powershell
# Ejecutar como Administrador
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$opensslPath = "C:\Program Files\OpenSSL-Win64\bin"

if ($currentPath -notlike "*$opensslPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$opensslPath", "Machine")
    Write-Host "OpenSSL agregado al PATH del sistema"
} else {
    Write-Host "OpenSSL ya está en el PATH"
}
```

## Paso 3: Verificar la Configuración

Abre una nueva ventana de PowerShell y ejecuta:

```powershell
openssl version
```

Deberías ver algo como:
```
OpenSSL 3.x.x xx xxx xxxx (Library: OpenSSL 3.x.x xx xxx xxxx)
```

## Paso 4: Generar Certificados

Una vez configurado OpenSSL, ejecuta:

```powershell
.\generate_certificate.ps1
```

## Alternativa: Script Sin OpenSSL

Si tienes problemas con OpenSSL, puedes usar el certificado que ya existe en el proyecto:

```powershell
# Crear directorios si no existen
if (!(Test-Path "resources\certificates")) {
    New-Item -ItemType Directory -Path "resources\certificates" -Force
}
if (!(Test-Path "resources\certs")) {
    New-Item -ItemType Directory -Path "resources\certs" -Force
}

# Copiar certificado existente
Copy-Item "resources\certificates\certificate.pem" "resources\certs\certificate.pem" -Force

Write-Host "Certificado configurado para modo beta" -ForegroundColor Green
Write-Host "Credenciales SUNAT Beta:" -ForegroundColor Yellow
Write-Host "- RUC: 20000000001"
Write-Host "- Usuario: MODDATOS"
Write-Host "- Contraseña: moddatos"
```

## Solución de Problemas

### Error: "OpenSSL no se reconoce como comando"

1. Verifica que OpenSSL esté instalado
2. Confirma la ruta de instalación
3. Asegúrate de haber agregado la ruta correcta al PATH
4. Reinicia la terminal después de modificar el PATH

### Error: "Acceso denegado" al modificar PATH

1. Ejecuta PowerShell como Administrador
2. O usa el método de interfaz gráfica

### Verificar Rutas de Instalación

```powershell
# Buscar OpenSSL en ubicaciones comunes
$locations = @(
    "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    "C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe",
    "C:\OpenSSL-Win64\bin\openssl.exe",
    "C:\OpenSSL-Win32\bin\openssl.exe"
)

foreach ($location in $locations) {
    if (Test-Path $location) {
        Write-Host "OpenSSL encontrado en: $location" -ForegroundColor Green
        $opensslDir = Split-Path $location
        Write-Host "Agregar al PATH: $opensslDir" -ForegroundColor Yellow
    }
}
```

## Enlaces Útiles

- **Descargar OpenSSL**: <mcreference link="https://slproweb.com/products/Win32OpenSSL.html" index="0">https://slproweb.com/products/Win32OpenSSL.html</mcreference>
- **Documentación OpenSSL**: https://www.openssl.org/docs/

---

**Nota**: Una vez configurado correctamente, podrás generar certificados válidos para usar con Greenter en modo beta de SUNAT.