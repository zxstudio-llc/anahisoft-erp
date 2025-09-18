<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Invoice;
use App\Models\Tenant\Settings;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use SoapClient;
use SoapFault;
use DOMDocument;
use XMLSecurityDSig;
use XMLSecurityKey;

class SriElectronicBillingService
{
    protected $settings;
    protected $soapClient;
    protected $lastResponse;

    public function __construct()
    {
        $this->settings = Settings::first();
    }

    /**
     * Generate electronic invoice for SRI Ecuador
     */
    public function generateInvoice(Invoice $invoice)
    {
        try {
            // Validar configuración
            if (!$this->validateSettings()) {
                throw new \Exception('Configuración de SRI incompleta. Verifique certificado y credenciales.');
            }

            // Generar clave de acceso
            $accessKey = $this->generateAccessKey($invoice);
            $invoice->access_key = $accessKey;

            // Generate XML content according to SRI specifications
            $xmlContent = $this->generateXmlContent($invoice, $accessKey);
            
            // Firmar XML con certificado digital
            $signedXml = $this->signXml($xmlContent);
            
            // Enviar a SRI
            $response = $this->sendToSri($signedXml, $accessKey);
            
            // Procesar respuesta
            if ($response['success']) {
                $this->saveInvoiceFiles($invoice, $signedXml, $response);
                
                return [
                    'success' => true,
                    'message' => 'Comprobante electrónico generado correctamente',
                    'data' => $response
                ];
            } else {
                // Guardar en estado rechazado
                $this->saveRejectedInvoice($invoice, $signedXml, $response);
                
                return [
                    'success' => false,
                    'message' => 'Error al enviar a SRI: ' . $response['message'],
                    'data' => $response
                ];
            }

        } catch (\Exception $e) {
            Log::error('Error generating electronic invoice for SRI: ' . $e->getMessage(), [
                'invoice_id' => $invoice->id,
                'tenant_id' => tenant()->id,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error al generar el comprobante electrónico: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Validate SRI settings
     */
    protected function validateSettings(): bool
    {
        return !empty($this->settings->tax_identification_number) &&
               !empty($this->settings->certificate_path) &&
               !empty($this->settings->certificate_password) &&
               file_exists($this->settings->certificate_path);
    }

    /**
     * Generate XML content according to SRI specifications
     */
    protected function generateXmlContent(Invoice $invoice, string $accessKey): string
    {
        $issueDate = $invoice->issue_date->format('d/m/Y');
        
        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        // Elemento raíz
        $factura = $xml->createElement('factura');
        $factura->setAttribute('id', 'comprobante');
        $factura->setAttribute('version', '1.1.0');
        $xml->appendChild($factura);

        // Info Tributaria
        $infoTributaria = $xml->createElement('infoTributaria');
        $factura->appendChild($infoTributaria);

        $this->addElement($xml, $infoTributaria, 'ambiente', $this->settings->environment_type);
        $this->addElement($xml, $infoTributaria, 'tipoEmision', $this->settings->emission_type);
        $this->addElement($xml, $infoTributaria, 'razonSocial', $this->settings->legal_name);
        $this->addElement($xml, $infoTributaria, 'nombreComercial', $this->settings->commercial_name ?? $this->settings->legal_name);
        $this->addElement($xml, $infoTributaria, 'ruc', $this->settings->tax_identification_number);
        $this->addElement($xml, $infoTributaria, 'claveAcceso', $accessKey);
        $this->addElement($xml, $infoTributaria, 'codDoc', '01'); // 01: Factura
        $this->addElement($xml, $infoTributaria, 'estab', $this->settings->establishment_code);
        $this->addElement($xml, $infoTributaria, 'ptoEmi', $this->settings->emission_point_code);
        $this->addElement($xml, $infoTributaria, 'secuencial', str_pad($invoice->sequential, 9, '0', STR_PAD_LEFT));
        $this->addElement($xml, $infoTributaria, 'dirMatriz', $this->settings->main_address);

        // Info Factura
        $infoFactura = $xml->createElement('infoFactura');
        $factura->appendChild($infoFactura);

        $this->addElement($xml, $infoFactura, 'fechaEmision', $issueDate);
        $this->addElement($xml, $infoFactura, 'dirEstablecimiento', $this->settings->branch_address ?? $this->settings->main_address);
        $this->addElement($xml, $infoFactura, 'obligadoContabilidad', 'NO');
        $this->addElement($xml, $infoFactura, 'tipoIdentificacionComprador', $invoice->customer->document_type ?? '04');
        $this->addElement($xml, $infoFactura, 'razonSocialComprador', $invoice->customer->name);
        $this->addElement($xml, $infoFactura, 'identificacionComprador', $invoice->customer->document_number);
        $this->addElement($xml, $infoFactura, 'direccionComprador', $invoice->customer->address ?? '');
        $this->addElement($xml, $infoFactura, 'totalSinImpuestos', number_format($invoice->subtotal_0 + $invoice->subtotal_12, 2, '.', ''));
        $this->addElement($xml, $infoFactura, 'totalDescuento', number_format($invoice->discount, 2, '.', ''));
        $this->addElement($xml, $infoFactura, 'totalConImpuestos', '');

        // Total con Impuestos
        $totalConImpuestos = $xml->createElement('totalConImpuestos');
        $infoFactura->appendChild($totalConImpuestos);

        if ($invoice->subtotal_12 > 0) {
            $totalImpuesto = $xml->createElement('totalImpuesto');
            $totalConImpuestos->appendChild($totalImpuesto);
            
            $this->addElement($xml, $totalImpuesto, 'codigo', '2');
            $this->addElement($xml, $totalImpuesto, 'codigoPorcentaje', '2');
            $this->addElement($xml, $totalImpuesto, 'baseImponible', number_format($invoice->subtotal_12, 2, '.', ''));
            $this->addElement($xml, $totalImpuesto, 'valor', number_format($invoice->iva, 2, '.', ''));
        }

        $this->addElement($xml, $infoFactura, 'propina', number_format($invoice->tip, 2, '.', ''));
        $this->addElement($xml, $infoFactura, 'importeTotal', number_format($invoice->total, 2, '.', ''));
        $this->addElement($xml, $infoFactura, 'moneda', 'DOLAR');

        // Detalles
        $detalles = $xml->createElement('detalles');
        $factura->appendChild($detalles);

        foreach ($invoice->details as $index => $detail) {
            $detalle = $xml->createElement('detalle');
            $detalles->appendChild($detalle);

            $this->addElement($xml, $detalle, 'codigoPrincipal', $detail->product->code ?? 'PROD' . ($index + 1));
            $this->addElement($xml, $detalle, 'descripcion', $detail->description);
            $this->addElement($xml, $detalle, 'cantidad', number_format($detail->quantity, 2, '.', ''));
            $this->addElement($xml, $detalle, 'precioUnitario', number_format($detail->unit_price, 2, '.', ''));
            $this->addElement($xml, $detalle, 'descuento', number_format($detail->discount, 2, '.', ''));
            $this->addElement($xml, $detalle, 'precioTotalSinImpuesto', number_format($detail->subtotal, 2, '.', ''));

            $impuestos = $xml->createElement('impuestos');
            $detalle->appendChild($impuestos);

            $impuesto = $xml->createElement('impuesto');
            $impuestos->appendChild($impuesto);

            $this->addElement($xml, $impuesto, 'codigo', '2');
            $this->addElement($xml, $impuesto, 'codigoPorcentaje', '2');
            $this->addElement($xml, $impuesto, 'tarifa', '12.00');
            $this->addElement($xml, $impuesto, 'baseImponible', number_format($detail->subtotal, 2, '.', ''));
            $this->addElement($xml, $impuesto, 'valor', number_format($detail->iva, 2, '.', ''));
        }

        return $xml->saveXML();
    }

    /**
     * Helper para agregar elementos XML
     */
    protected function addElement(DOMDocument $xml, $parent, $name, $value)
    {
        $element = $xml->createElement($name, htmlspecialchars($value));
        $parent->appendChild($element);
    }

    /**
     * Generate access key for SRI (Clave de Acceso)
     */
    protected function generateAccessKey(Invoice $invoice): string
    {
        $date = $invoice->issue_date->format('dmY');
        $tipoComprobante = '01'; // Factura
        $ruc = $this->settings->tax_identification_number;
        $ambiente = $this->settings->environment_type === 'production' ? '2' : '1';
        $serie = $this->settings->establishment_code . $this->settings->emission_point_code;
        $secuencial = str_pad($invoice->sequential, 9, '0', STR_PAD_LEFT);
        $codigoNumerico = mt_rand(10000000, 99999999); // Número aleatorio de 8 dígitos
        $tipoEmision = $this->settings->emission_type === 'normal' ? '1' : '2';

        $clave = $date . $tipoComprobante . $ruc . $ambiente . $serie . $secuencial . $codigoNumerico . $tipoEmision;
        
        // Agregar dígito verificador
        $clave .= $this->calculateVerificationDigit($clave);
        
        return $clave;
    }

    /**
     * Calculate verification digit for access key
     */
    protected function calculateVerificationDigit($clave): int
    {
        $factors = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
        
        $sum = 0;
        for ($i = 0; $i < 48; $i++) {
            $sum += intval($clave[$i]) * $factors[$i];
        }
        
        $remainder = $sum % 11;
        $digit = 11 - $remainder;
        
        if ($digit == 11) return 0;
        if ($digit == 10) return 1;
        return $digit;
    }

    /**
     * Sign XML with digital certificate
     */
    protected function signXml(string $xmlContent): string
    {
        if (!$this->settings->requires_electronic_signature) {
            return $xmlContent;
        }

        try {
            $doc = new DOMDocument();
            $doc->loadXML($xmlContent);

            $objDSig = new XMLSecurityDSig();
            $objDSig->setCanonicalMethod(XMLSecurityDSig::C14N);
            $objDSig->addReference(
                $doc,
                XMLSecurityDSig::SHA1,
                ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
                ['force_uri' => true]
            );

            // Load certificate
            $certificate = file_get_contents($this->settings->certificate_path);
            $certPassword = Crypt::decryptString($this->settings->certificate_password);

            $objKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, ['type' => 'private']);
            $objKey->loadKey($certificate, false, $certPassword);

            $objDSig->sign($objKey);
            $objDSig->add509Cert($certificate);

            $objDSig->appendSignature($doc->documentElement);

            return $doc->saveXML();

        } catch (\Exception $e) {
            Log::error('Error signing XML: ' . $e->getMessage());
            throw new \Exception('Error al firmar el documento XML: ' . $e->getMessage());
        }
    }

    /**
     * Send signed XML to SRI
     */
    protected function sendToSri(string $signedXml, string $accessKey): array
    {
        try {
            $endpoint = $this->settings->sri_mode === 'production' 
                ? $this->settings->endpoint_recepcion 
                : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

            $soapOptions = [
                'stream_context' => stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    ]
                ]),
                'trace' => 1,
                'exceptions' => true
            ];

            $client = new SoapClient($endpoint, $soapOptions);

            // Preparar parámetros para el envío
            $params = [
                'xml' => $signedXml
            ];

            // Enviar comprobante
            $response = $client->validarComprobante($params);

            $this->lastResponse = $response;

            // Procesar respuesta
            return $this->processSriResponse($response, $accessKey);

        } catch (SoapFault $e) {
            Log::error('SOAP Error sending to SRI: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error de comunicación con SRI: ' . $e->getMessage(),
                'state' => 'ERROR_COMUNICACION'
            ];
        } catch (\Exception $e) {
            Log::error('Error sending to SRI: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al enviar a SRI: ' . $e->getMessage(),
                'state' => 'ERROR'
            ];
        }
    }

    /**
     * Process SRI response
     */
    protected function processSriResponse($response, string $accessKey): array
    {
        if (!isset($response->RespuestaRecepcionComprobante)) {
            return [
                'success' => false,
                'message' => 'Respuesta inválida del SRI',
                'state' => 'ERROR_RESPUESTA'
            ];
        }

        $sriResponse = $response->RespuestaRecepcionComprobante;

        if (isset($sriResponse->comprobantes) && isset($sriResponse->comprobantes->comprobante)) {
            $comprobante = $sriResponse->comprobantes->comprobante;
            
            if ($comprobante->estado === 'RECIBIDA') {
                // Consultar autorización
                return $this->checkAuthorization($accessKey);
            }
        }

        if (isset($sriResponse->mensajes) && isset($sriResponse->mensajes->mensaje)) {
            $mensaje = $sriResponse->mensajes->mensaje;
            return [
                'success' => false,
                'message' => $mensaje->mensaje . ' (' . $mensaje->identificador . ')',
                'state' => 'RECHAZADO'
            ];
        }

        return [
            'success' => false,
            'message' => 'Respuesta desconocida del SRI',
            'state' => 'ERROR_DESCONOCIDO'
        ];
    }

    /**
     * Check authorization status
     */
    protected function checkAuthorization(string $accessKey): array
    {
        try {
            $endpoint = $this->settings->sri_mode === 'production'
                ? $this->settings->endpoint_autorizacion
                : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';

            $soapOptions = [
                'stream_context' => stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    ]
                ]),
                'trace' => 1,
                'exceptions' => true
            ];

            $client = new SoapClient($endpoint, $soapOptions);

            $params = [
                'claveAccesoComprobante' => $accessKey
            ];

            $response = $client->autorizacionComprobante($params);
            $this->lastResponse = $response;

            if (isset($response->RespuestaAutorizacionComprobante) &&
                isset($response->RespuestaAutorizacionComprobante->autorizaciones) &&
                isset($response->RespuestaAutorizacionComprobante->autorizaciones->autorizacion)) {
                
                $autorizacion = $response->RespuestaAutorizacionComprobante->autorizaciones->autorizacion;
                
                if ($autorizacion->estado === 'AUTORIZADO') {
                    return [
                        'success' => true,
                        'authorization_number' => $autorizacion->numeroAutorizacion,
                        'authorization_date' => $autorizacion->fechaAutorizacion,
                        'state' => 'AUTORIZADO',
                        'ambiente' => $this->settings->environment_type
                    ];
                } else {
                    $mensajes = [];
                    if (isset($autorizacion->mensajes) && isset($autorizacion->mensajes->mensaje)) {
                        foreach ($autorizacion->mensajes->mensaje as $mensaje) {
                            $mensajes[] = $mensaje->mensaje . ' (' . $mensaje->identificador . ')';
                        }
                    }
                    
                    return [
                        'success' => false,
                        'message' => implode('; ', $mensajes),
                        'state' => 'RECHAZADO'
                    ];
                }
            }

            return [
                'success' => false,
                'message' => 'No se pudo obtener autorización',
                'state' => 'ERROR_AUTORIZACION'
            ];

        } catch (\Exception $e) {
            Log::error('Error checking authorization: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al verificar autorización: ' . $e->getMessage(),
                'state' => 'ERROR_CONSULTA'
            ];
        }
    }

    /**
     * Save invoice files
     */
    protected function saveInvoiceFiles(Invoice $invoice, string $xmlContent, array $response): void
    {
        $tenantPath = "tenants/" . tenant()->id . "/invoices";
        Storage::makeDirectory($tenantPath);

        // Guardar XML
        $xmlPath = "{$tenantPath}/{$invoice->id}_{$invoice->sequential}_invoice.xml";
        Storage::put($xmlPath, $xmlContent);

        // Guardar respuesta de autorización si está disponible
        $responsePath = null;
        if (isset($response['authorization_number'])) {
            $responseData = json_encode($response, JSON_PRETTY_PRINT);
            $responsePath = "{$tenantPath}/{$invoice->id}_{$invoice->sequential}_response.json";
            Storage::put($responsePath, $responseData);
        }

        // Actualizar invoice
        $invoice->update([
            'xml_content' => $xmlContent,
            'authorization_number' => $response['authorization_number'] ?? null,
            'authorization_date' => $response['authorization_date'] ?? null,
            'status' => $response['state'] ?? 'AUTORIZADO',
            'access_key' => $invoice->access_key,
            'xml_path' => $xmlPath,
            'response_path' => $responsePath,
        ]);
    }

    /**
     * Save rejected invoice
     */
    protected function saveRejectedInvoice(Invoice $invoice, string $xmlContent, array $response): void
    {
        $tenantPath = "tenants/" . tenant()->id . "/invoices";
        Storage::makeDirectory($tenantPath);

        $xmlPath = "{$tenantPath}/{$invoice->id}_{$invoice->sequential}_rejected.xml";
        Storage::put($xmlPath, $xmlContent);

        $responsePath = "{$tenantPath}/{$invoice->id}_{$invoice->sequential}_rejection.json";
        Storage::put($responsePath, json_encode($response, JSON_PRETTY_PRINT));

        $invoice->update([
            'xml_content' => $xmlContent,
            'status' => $response['state'] ?? 'RECHAZADO',
            'access_key' => $invoice->access_key,
            'xml_path' => $xmlPath,
            'response_path' => $responsePath,
            'rejection_reason' => $response['message'] ?? 'Error desconocido'
        ]);
    }

    /**
     * Get last SOAP response for debugging
     */
    public function getLastResponse()
    {
        return $this->lastResponse;
    }

    /**
     * Get SOAP request/response for debugging
     */
    public function getSoapDebug()
    {
        if ($this->soapClient) {
            return [
                'request' => $this->soapClient->__getLastRequest(),
                'response' => $this->soapClient->__getLastResponse()
            ];
        }
        return null;
    }
}