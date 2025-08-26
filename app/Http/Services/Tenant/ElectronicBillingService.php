<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Sale;
use App\Models\Tenant\Settings;
use Greenter\See;
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\Model\Company\Company;
use Greenter\Model\Company\Address;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;
use Greenter\Model\Client\Client;
use Luecano\NumeroALetras\NumeroALetras;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ElectronicBillingService
{
    protected $see;
    protected $settings;
    protected $formatter;

    public function __construct()
    {
        $this->formatter = new NumeroALetras();
        try {
            $this->loadTenantSettings();
        } catch (\Exception $e) {
            Log::error('Failed to initialize ElectronicBillingService: ' . $e->getMessage());
            // Don't throw the exception, allow the service to work in degraded mode
            // The service will use placeholder XML generation instead
            $this->see = null;
            $this->settings = null;
        }
    }

    /**
     * Load tenant settings and initialize SEE
     */
    protected function loadTenantSettings()
    {
        $this->settings = Settings::first();
        
        if (!$this->settings) {
            throw new \Exception('No se encontraron configuraciones del tenant');
        }

        $this->initializeSee();
    }

    /**
     * Initialize Greenter SEE with tenant configuration
     */
    protected function initializeSee()
    {
        try {
            $this->see = new See();
            
            // Set service
            $this->see->setService($this->getSunatService());
            
            // Get credentials based on mode
            $credentials = $this->getCredentials();
            
            // Set credentials
            $this->see->setCredentials($credentials['ruc'], $credentials['sol_user'], $credentials['sol_pass']);
        } catch (\Exception $e) {
            Log::error('Failed to initialize SEE object: ' . $e->getMessage());
            $this->see = null;
            throw new \Exception('No se pudo inicializar el servicio de facturación electrónica: ' . $e->getMessage());
        }
        
        // Set certificate based on mode
        $mode = $credentials['sunat_mode'] ?? 'beta';
        
        if ($mode === 'beta') {
            // For beta mode, use a default test certificate
            $possibleCertPaths = [
                resource_path('certificates/certificate.pem'),
                resource_path('certs/certificate.pem'),
                base_path('vendor/greenter/greenter/packages/lite/tests/Resources/certificate.pem'),
                base_path('certs/certificate.pem')
            ];
            
            $certificateLoaded = false;
            foreach ($possibleCertPaths as $certPath) {
                if (file_exists($certPath)) {
                    try {
                        $certContent = file_get_contents($certPath);
                        if ($certContent !== false && $this->isValidCertificate($certContent)) {
                            // For PEM certificates, no password is needed
                            $this->see->setCertificate($certContent);
                            
                            // Verify that the factory is properly initialized after setting certificate
                            $factory = $this->see->getFactory();
                            if ($factory !== null) {
                                $certificateLoaded = true;
                                Log::info('Certificate and factory loaded successfully for beta mode', ['path' => $certPath]);
                                break;
                            } else {
                                Log::warning('Certificate loaded but factory is null', ['path' => $certPath]);
                            }
                        } else {
                            Log::warning('Invalid certificate format', ['path' => $certPath]);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Failed to load certificate from: ' . $certPath, ['error' => $e->getMessage()]);
                        continue;
                    }
                }
            }
            
            // If no certificate found, create a minimal test certificate for beta mode
            if (!$certificateLoaded) {
                Log::warning('No valid certificate found for beta mode, creating minimal test certificate');
                try {
                    // Create a minimal test certificate content for beta mode
                    $testCertContent = $this->getTestCertificateContent();
                    $this->see->setCertificate($testCertContent);
                    
                    $factory = $this->see->getFactory();
                    if ($factory !== null) {
                        $certificateLoaded = true;
                        Log::info('Test certificate created and factory initialized for beta mode');
                    } else {
                        Log::error('Factory is still null even with test certificate in beta mode');
                        throw new \Exception('No se pudo inicializar el factory de Greenter en modo beta');
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to initialize factory in beta mode: ' . $e->getMessage());
                    throw new \Exception('No se pudo inicializar el servicio de facturación electrónica en modo beta: ' . $e->getMessage());
                }
            }
        } else {
            // Production mode - require proper certificate
            $certificatePath = $credentials['certificate_path'] ?? null;
            
            if (!$certificatePath || !file_exists($certificatePath)) {
                throw new \Exception('Certificado digital requerido para modo producción');
            }
            
            $pfxContent = file_get_contents($certificatePath);
            if ($pfxContent === false) {
                throw new \Exception('No se pudo leer el contenido del certificado');
            }
            
            $password = $credentials['certificate_password'] ?: '';
            $this->see->setCertificate($pfxContent, $password);
        }
    }

    /**
     * Check if the service is properly initialized
     */
    protected function isServiceInitialized(): bool
    {
        return $this->see !== null && $this->settings !== null;
    }

    /**
     * Check if certificate content is valid
     */
    protected function isValidCertificate(string $certContent): bool
    {
        // Basic validation for PEM certificate format
        return strpos($certContent, '-----BEGIN CERTIFICATE-----') !== false && 
               strpos($certContent, '-----END CERTIFICATE-----') !== false &&
               strlen(trim($certContent)) > 100; // Minimum reasonable certificate length
    }

    /**
     * Get test certificate content for beta mode
     */
    protected function getTestCertificateContent(): string
    {
        // Try to get the certificate from the resources directory first
        $certPath = resource_path('certificates/certificate.pem');
        if (file_exists($certPath)) {
            $content = file_get_contents($certPath);
            if ($content !== false) {
                return $content;
            }
        }
        
        // Fallback to embedded test certificate for beta mode
        return "-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----";
    }

    /**
     * Check if service can generate proper XML
     */
    protected function canGenerateProperXml(): bool
    {
        if (!$this->isServiceInitialized()) {
            return false;
        }
        
        try {
            $factory = $this->see->getFactory();
            return $factory !== null;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get factory instance
     */
    protected function getFactory()
    {
        if ($this->see === null) {
            throw new \Exception('El servicio SEE no está inicializado.');
        }
        
        $factory = $this->see->getFactory();
        if ($factory === null) {
            throw new \Exception('El factory de Greenter no está inicializado. Asegúrese de que el certificado se haya cargado correctamente.');
        }
        return $factory;
    }

    /**
     * Get SUNAT service based on mode
     */
    protected function getSunatService()
    {
        $mode = $this->settings->sunat_mode ?: 'beta';
        
        if ($mode === 'production') {
            return SunatEndpoints::FE_PRODUCCION;
        }
        
        return SunatEndpoints::FE_BETA;
    }

    /**
     * Get credentials based on mode (test credentials for beta, tenant credentials for production)
     */
    protected function getCredentials(): array
    {
        $mode = $this->settings->sunat_mode ?: 'beta';
        
        if ($mode === 'beta') {
            // Use SUNAT test credentials for beta mode
            return [
                'ruc' => '20000000001',
                'sol_user' => 'MODDATOS',
                'sol_pass' => 'moddatos',
                'certificate_path' => null,
                'certificate_password' => null,
                'sunat_mode' => 'beta',
            ];
        }
        
        // Use tenant credentials for production mode
        if (!$this->settings->hasSunatCredentials()) {
            throw new \Exception('Las credenciales de SUNAT no están configuradas para modo producción');
        }
        
        return [
            'ruc' => $this->settings->ruc,
            'sol_user' => $this->settings->sol_user,
            'sol_pass' => $this->settings->sol_pass,
            'certificate_path' => $this->settings->certificate_path,
            'certificate_password' => $this->settings->certificate_password,
            'sunat_mode' => $mode,
        ];
    }

    /**
     * Create company from settings
     */
    protected function createCompany(): Company
    {
        $mode = $this->settings->sunat_mode ?: 'beta';
        $credentials = $this->getCredentials();
        
        $address = new Address();
        
        if ($mode === 'beta') {
            // Use SUNAT test company data for beta mode
            $address->setUbigueo('150101')
                ->setDepartamento('LIMA')
                ->setProvincia('LIMA')
                ->setDistrito('LIMA')
                ->setDireccion('AV. LIMA 123');
        } else {
            // Use tenant company data for production mode
            $address->setUbigueo($this->settings->ubigeo ?: '150101')
                ->setDepartamento($this->settings->department ?: 'LIMA')
                ->setProvincia($this->settings->province ?: 'LIMA')
                ->setDistrito($this->settings->district ?: 'LIMA')
                ->setDireccion($this->settings->address ?: 'AV. LIMA 123');
        }

        $company = new Company();
        
        if ($mode === 'beta') {
            // Use SUNAT test company data
            $company->setRuc($credentials['ruc'])
                ->setRazonSocial('EMPRESA DE PRUEBA')
                ->setNombreComercial('EMPRESA DE PRUEBA')
                ->setAddress($address);
        } else {
            // Use tenant company data
            $company->setRuc($credentials['ruc'])
                ->setRazonSocial($this->settings->business_name ?: $this->settings->company_name)
                ->setNombreComercial($this->settings->trade_name ?: $this->settings->company_name)
                ->setAddress($address);
        }

        return $company;
    }

    /**
     * Generate electronic invoice
     */
    public function generateInvoice(Sale $sale)
    {
        // Temporary: if configured for Ecuador SRI, delegate to SRI service skeleton
        try {
            $settings = Settings::first();
            if ($settings && !empty($settings->sri_mode)) {
                $sri = new SriElectronicBillingService();
                return $sri->generateInvoice($sale);
            }
        } catch (\Throwable $e) {
            Log::warning('Falling back to SUNAT flow: '.$e->getMessage());
        }

        try {
            // Check if service is properly initialized
            if (!$this->isServiceInitialized()) {
                throw new \Exception('El servicio de facturación electrónica no está correctamente inicializado.');
            }
            
            $invoice = $this->createInvoiceFromSale($sale);
            
            // Always generate local files first
            $this->generateLocalFiles($sale, $invoice);
            
            $sunatState = 'PENDIENTE';
            $sunatResponse = null;
            $hash = null;
            
            try {
                // Try to send to SUNAT
                $result = $this->see->send($invoice);
                
                if ($result->isSuccess()) {
                    $sunatState = 'ACEPTADO';
                    $sunatResponse = $result->getCdrResponse();
                    $hash = $result->getCdrResponse()->getDigestValue() ?? null;
                    
                    // Save CDR if available
                    if ($result->getCdrZip()) {
                        $tenantPath = "tenants/" . tenant()->id . "/invoices";
                        Storage::put("{$tenantPath}/{$sale->id}_cdr.zip", $result->getCdrZip());
                    }
                } else {
                    $sunatState = 'RECHAZADO';
                    Log::warning('SUNAT rejected invoice', [
                        'sale_id' => $sale->id,
                        'error' => $result->getError()->getMessage()
                    ]);
                }
            } catch (\Exception $sunatError) {
                // SUNAT communication failed, but we still have local files
                $sunatState = 'ERROR';
                Log::warning('SUNAT communication failed', [
                    'sale_id' => $sale->id,
                    'error' => $sunatError->getMessage()
                ]);
            }

            // Update sale with electronic data
            $sale->update([
                'sunat_response' => $sunatResponse,
                'xml_path' => "tenants/" . tenant()->id . "/invoices/{$sale->id}_invoice.xml",
                'cdr_path' => "tenants/" . tenant()->id . "/invoices/{$sale->id}_cdr.zip",
                'pdf_path' => "tenants/" . tenant()->id . "/invoices/{$sale->id}_invoice.pdf",
                'sunat_state' => $sunatState,
                'hash' => $hash,
            ]);

            return [
                'success' => true,
                'message' => 'Comprobante electrónico generado correctamente',
                'data' => [
                    'xml_path' => $sale->xml_path,
                    'cdr_path' => $sale->cdr_path,
                    'pdf_path' => $sale->pdf_path,
                    'hash' => $sale->hash,
                    'sunat_state' => $sunatState
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Error generating electronic invoice: ' . $e->getMessage(), [
                'sale_id' => $sale->id,
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
     * Create Greenter Invoice from Sale
     */
    protected function createInvoiceFromSale(Sale $sale): Invoice
    {
        // Create client
        $client = new Client();
        $client->setTipoDoc($sale->client->document_type)
            ->setNumDoc($sale->client->document_number)
            ->setRznSocial($sale->client->name);

        // Create company
        $company = $this->createCompany();

        // Create invoice
        $invoice = new Invoice();
        $invoice->setUblVersion('2.1')
            ->setTipoOperacion('0101') // Venta interna
            ->setTipoDoc($sale->document_type ?: '01') // Factura
            ->setSerie($sale->series)
            ->setCorrelativo(str_pad($sale->number, 8, '0', STR_PAD_LEFT))
            ->setFechaEmision(new \DateTime($sale->created_at))
            ->setTipoMoneda('PEN')
            ->setClient($client)
            ->setCompany($company)
            ->setMtoOperGravadas($sale->subtotal)
            ->setMtoIGV($sale->igv)
            ->setTotalImpuestos($sale->igv)
            ->setMtoImpVenta($sale->total);

        // Add details
        $details = [];
        foreach ($sale->products as $product) {
            $detail = new SaleDetail();
            $detail->setCodProducto($product->code ?: 'PROD001')
                ->setUnidad('NIU')
                ->setCantidad($product->pivot->quantity)
                ->setDescripcion($product->name)
                ->setMtoBaseIgv($product->pivot->subtotal)
                ->setPorcentajeIgv(18.00)
                ->setIgv($product->pivot->igv)
                ->setTipAfeIgv('10')
                ->setTotalImpuestos($product->pivot->igv)
                ->setMtoValorVenta($product->pivot->subtotal)
                ->setMtoValorUnitario($product->pivot->price)
                ->setMtoPrecioUnitario($product->pivot->total / $product->pivot->quantity);

            $details[] = $detail;
        }
        $invoice->setDetails($details);

        // Add legends
        $legend = new Legend();
        $legend->setCode('1000')
            ->setValue($this->numberToWords($sale->total));
        $invoice->setLegends([$legend]);

        return $invoice;
    }

    /**
     * Generate local files (XML and PDF) without SUNAT interaction
     */
    protected function generateLocalFiles(Sale $sale, Invoice $invoice)
    {
        $tenantPath = "tenants/" . tenant()->id . "/invoices";
        
        // Ensure directory exists
        Storage::makeDirectory($tenantPath);

        $xmlGenerated = false;
        
        // Try multiple approaches to generate XML
        try {
            // Check if SEE is properly initialized
            if ($this->see === null) {
                throw new \Exception('SEE service is not initialized');
            }
            
            // Try to generate XML using Greenter factory
            $factory = $this->see->getFactory();
            
            if ($factory !== null) {
                try {
                    $xmlContent = $factory->getXmlSigned($invoice);
                    
                    if ($xmlContent && !empty(trim($xmlContent))) {
                        Storage::put("{$tenantPath}/{$sale->id}_invoice.xml", $xmlContent);
                        Log::info('XML generated successfully using Greenter factory', ['sale_id' => $sale->id]);
                        $xmlGenerated = true;
                    } else {
                        Log::warning('Factory returned empty XML content', ['sale_id' => $sale->id]);
                    }
                } catch (\Exception $factoryError) {
                    Log::warning('Factory XML generation failed', [
                        'sale_id' => $sale->id,
                        'error' => $factoryError->getMessage()
                    ]);
                }
            } else {
                Log::warning('Greenter factory is null', ['sale_id' => $sale->id]);
            }
        } catch (\Exception $e) {
            Log::warning('SEE service error during XML generation', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage()
            ]);
        }
        
        // If XML generation failed, create a simple XML placeholder
        if (!$xmlGenerated) {
            Log::info('Using placeholder XML for sale', ['sale_id' => $sale->id]);
            $xmlContent = $this->createSimpleXmlContent($sale, $invoice);
            Storage::put("{$tenantPath}/{$sale->id}_invoice.xml", $xmlContent);
        }

        // Generate and save PDF
        $this->generatePdf($sale, $invoice);
    }

    /**
     * Save invoice files (XML, CDR, PDF)
     */
    protected function saveInvoiceFiles(Sale $sale, $result, Invoice $invoice)
    {
        $tenantPath = "tenants/" . tenant()->id . "/invoices";
        
        // Ensure directory exists
        Storage::makeDirectory($tenantPath);

        try {
            // Check if SEE is properly initialized
            if ($this->see === null) {
                throw new \Exception('SEE service is not initialized');
            }
            
            $factory = $this->see->getFactory();
            if ($factory === null) {
                throw new \Exception('Greenter factory is null');
            }
            
            // Save XML
            $xmlContent = $factory->getLastXml();
            Storage::put("{$tenantPath}/{$sale->id}_invoice.xml", $xmlContent);
        } catch (\Exception $e) {
            Log::warning('Failed to save XML from factory, using placeholder', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage()
            ]);
            
            // Create placeholder XML if factory fails
            $xmlContent = $this->createSimpleXmlContent($sale, $invoice);
            Storage::put("{$tenantPath}/{$sale->id}_invoice.xml", $xmlContent);
        }

        // Save CDR if available
        if ($result->getCdrZip()) {
            Storage::put("{$tenantPath}/{$sale->id}_cdr.zip", $result->getCdrZip());
        }

        // Generate and save PDF
        $this->generatePdf($sale, $invoice);
    }

    /**
     * Generate PDF from invoice
     */
    protected function generatePdf(Sale $sale, Invoice $invoice)
    {
        // For now, we'll create a simple PDF content
        // In a real implementation, you would use a PDF library like TCPDF or DomPDF
        $pdfContent = $this->createSimplePdfContent($sale, $invoice);
        
        $tenantPath = "tenants/" . tenant()->id . "/invoices";
        Storage::put("{$tenantPath}/{$sale->id}_invoice.pdf", $pdfContent);
    }

    /**
     * Create simple PDF content (placeholder)
     */
    protected function createSimplePdfContent(Sale $sale, Invoice $invoice): string
    {
        // This is a placeholder. In a real implementation, you would generate actual PDF content
        return "PDF content for invoice {$invoice->getSerie()}-{$invoice->getCorrelativo()}";
    }

    /**
     * Create simple XML content (placeholder)
     */
    protected function createSimpleXmlContent(Sale $sale, Invoice $invoice): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">' . "\n";
        $xml .= '  <!-- DOCUMENTO GENERADO EN MODO LOCAL - NO VÁLIDO PARA SUNAT -->' . "\n";
        $xml .= '  <ID>' . $invoice->getSerie() . '-' . $invoice->getCorrelativo() . '</ID>' . "\n";
        $xml .= '  <IssueDate>' . $invoice->getFechaEmision()->format('Y-m-d') . '</IssueDate>' . "\n";
        $xml .= '  <DocumentCurrencyCode>' . $invoice->getTipoMoneda() . '</DocumentCurrencyCode>' . "\n";
        $xml .= '  <AccountingSupplierParty>' . "\n";
        $xml .= '    <Party>' . "\n";
        $xml .= '      <PartyName><Name>' . htmlspecialchars($invoice->getCompany()->getRazonSocial()) . '</Name></PartyName>' . "\n";
        $xml .= '      <PartyTaxScheme>' . "\n";
        $xml .= '        <RegistrationName>' . htmlspecialchars($invoice->getCompany()->getRazonSocial()) . '</RegistrationName>' . "\n";
        $xml .= '        <CompanyID>' . $invoice->getCompany()->getRuc() . '</CompanyID>' . "\n";
        $xml .= '      </PartyTaxScheme>' . "\n";
        $xml .= '    </Party>' . "\n";
        $xml .= '  </AccountingSupplierParty>' . "\n";
        $xml .= '  <AccountingCustomerParty>' . "\n";
        $xml .= '    <Party>' . "\n";
        $xml .= '      <PartyName><Name>' . htmlspecialchars($invoice->getClient()->getRznSocial()) . '</Name></PartyName>' . "\n";
        $xml .= '      <PartyTaxScheme>' . "\n";
        $xml .= '        <RegistrationName>' . htmlspecialchars($invoice->getClient()->getRznSocial()) . '</RegistrationName>' . "\n";
        $xml .= '        <CompanyID>' . $invoice->getClient()->getNumDoc() . '</CompanyID>' . "\n";
        $xml .= '      </PartyTaxScheme>' . "\n";
        $xml .= '    </Party>' . "\n";
        $xml .= '  </AccountingCustomerParty>' . "\n";
        
        // Add invoice lines
        $xml .= '  <InvoiceLines>' . "\n";
        $details = $invoice->getDetails();
        foreach ($details as $index => $detail) {
            $xml .= '    <InvoiceLine>' . "\n";
            $xml .= '      <ID>' . ($index + 1) . '</ID>' . "\n";
            $xml .= '      <InvoicedQuantity>' . $detail->getCantidad() . '</InvoicedQuantity>' . "\n";
            $xml .= '      <LineExtensionAmount>' . $detail->getMtoValorVenta() . '</LineExtensionAmount>' . "\n";
            $xml .= '      <Item>' . "\n";
            $xml .= '        <Description>' . htmlspecialchars($detail->getDescripcion()) . '</Description>' . "\n";
            $xml .= '      </Item>' . "\n";
            $xml .= '    </InvoiceLine>' . "\n";
        }
        $xml .= '  </InvoiceLines>' . "\n";
        
        $xml .= '  <LegalMonetaryTotal>' . "\n";
        $xml .= '    <LineExtensionAmount>' . $invoice->getMtoOperGravadas() . '</LineExtensionAmount>' . "\n";
        $xml .= '    <TaxExclusiveAmount>' . $invoice->getMtoOperGravadas() . '</TaxExclusiveAmount>' . "\n";
        $xml .= '    <TaxInclusiveAmount>' . $invoice->getMtoImpVenta() . '</TaxInclusiveAmount>' . "\n";
        $xml .= '    <PayableAmount currencyID="' . $invoice->getTipoMoneda() . '">' . $invoice->getMtoImpVenta() . '</PayableAmount>' . "\n";
        $xml .= '  </LegalMonetaryTotal>' . "\n";
        $xml .= '</Invoice>';
        
        return $xml;
    }

    /**
     * Get document series for type
     */
    protected function getDocumentSeries(string $type): string
    {
        $series = $this->settings->document_series;
        
        if (!$series || !isset($series[$type])) {
            $defaultSeries = $this->settings->getDefaultDocumentSeries();
            return array_key_first($defaultSeries[$type] ?? ['F001' => []]);
        }

        return array_key_first($series[$type]);
    }

    /**
     * Get next correlative for document type
     */
    protected function getNextCorrelative(string $type): string
    {
        $series = $this->getDocumentSeries($type);
        
        // In a real implementation, you would track correlatives in database
        // For now, we'll use a simple counter based on existing sales
        $lastSale = Sale::where('document_type', '01')
            ->where('series', $series)
            ->orderBy('correlative', 'desc')
            ->first();

        $nextCorrelative = $lastSale ? ($lastSale->correlative + 1) : 1;
        
        return str_pad($nextCorrelative, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Convert number to words
     */
    protected function numberToWords($number): string
    {
        return strtoupper($this->formatter->toInvoice($number, 2));
    }
}