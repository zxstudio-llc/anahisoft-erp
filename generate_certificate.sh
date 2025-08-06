#!/bin/bash

# Script para generar certificados para Greenter en modo beta
# Este script crea certificados autofirmados válidos para pruebas con SUNAT beta

echo "Generando certificados para Greenter (modo beta)..."

# Crear directorio para certificados si no existe
mkdir -p resources/certificates
mkdir -p resources/certs

# Paso 1: Generar la clave privada
echo "Paso 1: Generando clave privada..."
openssl genrsa 2048 > resources/certificates/private.key

# Paso 2: Generar el certificado autofirmado
echo "Paso 2: Generando certificado autofirmado..."
openssl req -x509 -days 3600 -new -key resources/certificates/private.key -out resources/certificates/certificate.cer -subj "/C=PE/ST=Lima/L=Lima/O=GREENTER SAC/OU=GREENTER SAC/CN=Greenter"

# Paso 3: Convertir a formato PEM (combinar certificado y clave)
echo "Paso 3: Creando certificado en formato PEM..."
cat resources/certificates/certificate.cer > resources/certificates/certificate.pem
echo "" >> resources/certificates/certificate.pem
cat resources/certificates/private.key >> resources/certificates/certificate.pem

# Crear copia en directorio alternativo
cp resources/certificates/certificate.pem resources/certs/certificate.pem

echo "¡Certificados generados exitosamente!"
echo "Archivos creados:"
echo "- resources/certificates/private.key (clave privada)"
echo "- resources/certificates/certificate.cer (certificado)"
echo "- resources/certificates/certificate.pem (certificado PEM para Greenter)"
echo "- resources/certs/certificate.pem (copia de respaldo)"
echo ""
echo "Credenciales para modo beta de SUNAT:"
echo "- RUC: 20000000001"
echo "- Usuario SOL: MODDATOS"
echo "- Contraseña SOL: moddatos"
echo ""
echo "El certificado tiene una validez de 3600 días (aproximadamente 10 años)."
echo "Estos certificados son SOLO para pruebas en el entorno beta de SUNAT."