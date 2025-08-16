# Script de PowerShell para generar certificados para Greenter en modo beta
# Este script crea certificados autofirmados válidos para pruebas con SUNAT beta

Write-Host "Generando certificados para Greenter (modo beta)..." -ForegroundColor Green

# Verificar si OpenSSL está disponible
try {
    $opensslVersion = openssl version
    Write-Host "OpenSSL encontrado: $opensslVersion" -ForegroundColor Yellow
} catch {
    Write-Host "ERROR: OpenSSL no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "Por favor instala OpenSSL desde: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Red
    exit 1
}

# Crear directorios para certificados si no existen
if (!(Test-Path "resources\certificates")) {
    New-Item -ItemType Directory -Path "resources\certificates" -Force | Out-Null
}
if (!(Test-Path "resources\certs")) {
    New-Item -ItemType Directory -Path "resources\certs" -Force | Out-Null
}

try {
    # Paso 1: Generar la clave privada
    Write-Host "Paso 1: Generando clave privada..." -ForegroundColor Cyan
    & openssl genrsa 2048 | Out-File -FilePath "resources\certificates\private.key" -Encoding ASCII
    
    if (!(Test-Path "resources\certificates\private.key")) {
        throw "Error al generar la clave privada"
    }
    
    # Paso 2: Generar el certificado autofirmado
    Write-Host "Paso 2: Generando certificado autofirmado..." -ForegroundColor Cyan
    # Usar configuración mínima sin archivo openssl.cnf
    $env:OPENSSL_CONF = $null
    & openssl req -x509 -days 3600 -new -key "resources\certificates\private.key" -out "resources\certificates\certificate.cer" -subj "/C=PE/ST=Lima/L=Lima/O=GREENTER SAC/OU=GREENTER SAC/CN=Greenter" -config NUL
    
    if (!(Test-Path "resources\certificates\certificate.cer")) {
        throw "Error al generar el certificado"
    }
    
    # Paso 3: Crear certificado en formato PEM (combinar certificado y clave)
    Write-Host "Paso 3: Creando certificado en formato PEM..." -ForegroundColor Cyan
    
    # Leer el contenido del certificado y la clave
    $certContent = Get-Content "resources\certificates\certificate.cer" -Raw
    $keyContent = Get-Content "resources\certificates\private.key" -Raw
    
    # Combinar certificado y clave en formato PEM
    $pemContent = $certContent + "`n" + $keyContent
    
    # Guardar el archivo PEM
    $pemContent | Out-File -FilePath "resources\certificates\certificate.pem" -Encoding ASCII
    
    # Crear copia en directorio alternativo
    Copy-Item "resources\certificates\certificate.pem" "resources\certs\certificate.pem"
    
    Write-Host "`n¡Certificados generados exitosamente!" -ForegroundColor Green
    Write-Host "Archivos creados:" -ForegroundColor Yellow
    Write-Host "- resources\certificates\private.key (clave privada)"
    Write-Host "- resources\certificates\certificate.cer (certificado)"
    Write-Host "- resources\certificates\certificate.pem (certificado PEM para Greenter)"
    Write-Host "- resources\certs\certificate.pem (copia de respaldo)"
    
    Write-Host "`nCredenciales para modo beta de SUNAT:" -ForegroundColor Yellow
    Write-Host "- RUC: 20000000001" -ForegroundColor White
    Write-Host "- Usuario SOL: MODDATOS" -ForegroundColor White
    Write-Host "- Contraseña SOL: moddatos" -ForegroundColor White
    
    Write-Host "`nEl certificado tiene una validez de 3600 días (aproximadamente 10 años)." -ForegroundColor Cyan
    Write-Host "Estos certificados son SOLO para pruebas en el entorno beta de SUNAT." -ForegroundColor Red
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifica que OpenSSL esté correctamente instalado y en el PATH." -ForegroundColor Red
    exit 1
}