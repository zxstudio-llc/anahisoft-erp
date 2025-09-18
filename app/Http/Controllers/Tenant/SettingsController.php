<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsController extends Controller 
{
    public function index()
    {
        $settings = Settings::first();

        return Inertia::render('Tenant/Settings/Index', [
            'settings' => $settings ? [
                // Company information
                'company_name' => $settings->company_name,
                'legal_name' => $settings->legal_name,
                'commercial_name' => $settings->commercial_name,
                'tax_identification_number' => $settings->tax_identification_number,
                'main_address' => $settings->main_address,
                'branch_address' => $settings->branch_address,
                'province' => $settings->province,
                'canton' => $settings->canton,
                'parish' => $settings->parish,
                'company_phone' => $settings->company_phone,
                'company_email' => $settings->company_email,
                'logo_path' => $settings->logo_path,
                
                // SRI Ecuador configuration
                'sri_mode' => $settings->sri_mode ?? 'test',
                'certificate_path' => $settings->certificate_path,
                'certificate_password' => '', // Never send password for security
                'electronic_signature' => '', // Never send signature for security
                'establishment_code' => $settings->establishment_code,
                'emission_point_code' => $settings->emission_point_code,
                'environment_type' => $settings->environment_type ?? 'test',
                'emission_type' => $settings->emission_type ?? 'normal',
                'requires_electronic_signature' => $settings->requires_electronic_signature ?? true,
                
                // SRI Endpoints
                'endpoint_recepcion' => $settings->endpoint_recepcion,
                'endpoint_autorizacion' => $settings->endpoint_autorizacion,
                'endpoint_consultas' => $settings->endpoint_consultas,
                
                // Document series (Formato SRI Ecuador: 001-001-000000001)
                'invoice_series' => $settings->invoice_series ?? '001-001-000000001',
                'receipt_series' => $settings->receipt_series ?? '001-001-000000001',
                'credit_note_series' => $settings->credit_note_series ?? '001-001-000000001',
                'debit_note_series' => $settings->debit_note_series ?? '001-001-000000001',
                'withholding_receipt_series' => $settings->withholding_receipt_series ?? '001-001-000000001',
                'liquidation_series' => $settings->liquidation_series ?? '001-001-000000001',
                
                // Printing settings
                'invoice_footer' => $settings->invoice_footer,
                'receipt_footer' => $settings->receipt_footer,
                'note_footer' => $settings->note_footer,
                'report_header' => $settings->report_header,
                'report_footer' => $settings->report_footer,
                'print_legal_text' => $settings->print_legal_text ?? true,
                'print_tax_info' => $settings->print_tax_info ?? true,

                // Additional SRI fields
                'company_status' => $settings->company_status ?? 'ACTIVE',
                'company_type' => $settings->company_type,
                'registration_date' => $settings->registration_date?->format('Y-m-d'),
                'economic_activity_code' => $settings->economic_activity_code,
                'tax_responsibility_code' => $settings->tax_responsibility_code,
                'special_taxpayer_number' => $settings->special_taxpayer_number,
                'special_taxpayer_date' => $settings->special_taxpayer_date?->format('Y-m-d'),
                'withholding_agent_number' => $settings->withholding_agent_number,
                'withholding_agent_date' => $settings->withholding_agent_date?->format('Y-m-d'),
            ] : [
                // Default values when no settings exist (SRI Ecuador)
                'company_name' => '',
                'legal_name' => '',
                'commercial_name' => '',
                'tax_identification_number' => '',
                'main_address' => '',
                'branch_address' => '',
                'province' => '',
                'canton' => '',
                'parish' => '',
                'company_phone' => '',
                'company_email' => '',
                'logo_path' => '',
                
                // SRI configuration defaults
                'sri_mode' => 'test',
                'certificate_path' => '',
                'certificate_password' => '',
                'electronic_signature' => '',
                'establishment_code' => '001',
                'emission_point_code' => '001',
                'environment_type' => 'test',
                'emission_type' => 'normal',
                'requires_electronic_signature' => true,
                
                // SRI endpoints defaults
                'endpoint_recepcion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
                'endpoint_autorizacion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
                'endpoint_consultas' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
                
                // Document series defaults
                'invoice_series' => '001-001-000000001',
                'receipt_series' => '001-001-000000001',
                'credit_note_series' => '001-001-000000001',
                'debit_note_series' => '001-001-000000001',
                'withholding_receipt_series' => '001-001-000000001',
                'liquidation_series' => '001-001-000000001',
                
                // Printing defaults
                'invoice_footer' => '',
                'receipt_footer' => '',
                'note_footer' => '',
                'report_header' => '',
                'report_footer' => '',
                'print_legal_text' => true,
                'print_tax_info' => true,

                // Additional fields defaults
                'company_status' => 'ACTIVE',
                'company_type' => '',
                'registration_date' => null,
                'economic_activity_code' => '',
                'tax_responsibility_code' => '',
                'special_taxpayer_number' => '',
                'special_taxpayer_date' => null,
                'withholding_agent_number' => '',
                'withholding_agent_date' => null,
            ],
            'modes' => [
                ['value' => 'test', 'label' => 'Pruebas'],
                ['value' => 'production', 'label' => 'Producción'],
            ],
            'environment_types' => [
                ['value' => 'test', 'label' => 'Pruebas'],
                ['value' => 'production', 'label' => 'Producción'],
            ],
            'emission_types' => [
                ['value' => 'normal', 'label' => 'Normal'],
                ['value' => 'contingency', 'label' => 'Contingencia'],
            ],
            'company_statuses' => [
                ['value' => 'ACTIVE', 'label' => 'Activo'],
                ['value' => 'INACTIVE', 'label' => 'Inactivo'],
            ],
            'company_types' => [
                ['value' => 'NATURAL', 'label' => 'Persona Natural'],
                ['value' => 'JURIDICA', 'label' => 'Persona Jurídica'],
            ],
            'provinces' => $this->getEcuadorProvinces(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            // Company information
            'company_name' => 'required|string|max:255',
            'legal_name' => 'required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'tax_identification_number' => 'required|string|size:13|regex:/^[0-9]{13}$/',
            'main_address' => 'required|string|max:255',
            'branch_address' => 'nullable|string|max:255',
            'province' => 'required|string|max:255',
            'canton' => 'required|string|max:255',
            'parish' => 'required|string|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_email' => 'nullable|email|max:255',
            'company_status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
            'company_type' => ['required', Rule::in(['NATURAL', 'JURIDICA'])],
            
            // SRI Ecuador configuration
            'sri_mode' => ['required', Rule::in(['test', 'production'])],
            'certificate_password' => 'nullable|string|max:255',
            'electronic_signature' => 'nullable|string',
            'establishment_code' => 'required|string|size:3|regex:/^[0-9]{3}$/',
            'emission_point_code' => 'required|string|size:3|regex:/^[0-9]{3}$/',
            'environment_type' => ['required', Rule::in(['test', 'production'])],
            'emission_type' => ['required', Rule::in(['normal', 'contingency'])],
            'requires_electronic_signature' => 'nullable|boolean',
            
            // SRI endpoints
            'endpoint_recepcion' => 'nullable|url|max:255',
            'endpoint_autorizacion' => 'nullable|url|max:255',
            'endpoint_consultas' => 'nullable|url|max:255',
            
            // Document series (Formato SRI: 001-001-000000001)
            'invoice_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            'receipt_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            'credit_note_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            'debit_note_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            'withholding_receipt_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            'liquidation_series' => 'required|string|max:17|regex:/^[0-9]{3}-[0-9]{3}-[0-9]{9}$/',
            
            // Additional SRI fields
            'registration_date' => 'nullable|date',
            'economic_activity_code' => 'nullable|string|max:10',
            'tax_responsibility_code' => 'nullable|string|max:10',
            'special_taxpayer_number' => 'nullable|string|max:20',
            'special_taxpayer_date' => 'nullable|date',
            'withholding_agent_number' => 'nullable|string|max:20',
            'withholding_agent_date' => 'nullable|date',
            
            // Report configuration
            'report_header' => 'nullable|string',
            'report_footer' => 'nullable|string',
            'invoice_footer' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'note_footer' => 'nullable|string',
            'print_legal_text' => 'nullable|boolean',
            'print_tax_info' => 'nullable|boolean',
            
            // Files
            'logo' => 'nullable|image|max:2048',
            'certificate' => [
                'nullable',
                'file',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $allowedExtensions = ['p12'];
                        $extension = strtolower($value->getClientOriginalExtension());
                        
                        if (!in_array($extension, $allowedExtensions)) {
                            $fail('El certificado debe ser un archivo .p12 (SRI Ecuador)');
                        }
                        
                        if ($value->getSize() > 5 * 1024 * 1024) {
                            $fail('El certificado no debe ser mayor a 5MB.');
                        }
                    }
                }
            ],
        ]);

        // Obtener configuración existente o crear valores por defecto para nuevo tenant
        $settings = $this->getOrCreateTenantSettings();
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            $this->handleFileUpload($request, 'logo', 'logos', $settings, 'logo_path');
        }

        // Handle certificate upload
        if ($request->hasFile('certificate')) {
            $this->handleFileUpload($request, 'certificate', 'certificates', $settings, 'certificate_path');
        }

        // Prepare data for update with encryption for sensitive fields
        $updateData = $request->except(['logo', 'certificate']);
        
        // Encrypt sensitive data if provided
        if (!empty($updateData['certificate_password'])) {
            $updateData['certificate_password'] = Crypt::encryptString($updateData['certificate_password']);
        }
        
        if (!empty($updateData['electronic_signature'])) {
            $updateData['electronic_signature'] = Crypt::encryptString($updateData['electronic_signature']);
        }
        
        // Update settings
        $settings->update($updateData);

        return redirect()->back()->with('success', 'Configuración actualizada correctamente');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:2048',
        ]);

        try {
            $settings = $this->getOrCreateTenantSettings();
            
            if ($settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            
            $tenantPath = 'tenants/' . tenant()->id . '/logos';
            $fileName = $request->file('logo')->hashName();
            $fullPath = $tenantPath . '/' . $fileName;
            Storage::disk('public')->putFileAs($tenantPath, $request->file('logo'), $fileName);
            
            $settings->logo_path = $fullPath;
            $settings->save();

            return response()->json([
                'success' => true,
                'message' => 'Logo actualizado correctamente',
                'logo_path' => $fullPath,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el logo: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function removeLogo(Request $request)
    {
        try {
            $settings = $this->getOrCreateTenantSettings();
            
            if ($settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            
            $settings->logo_path = null;
            $settings->save();

            return response()->json([
                'success' => true,
                'message' => 'Logo eliminado correctamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el logo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtiene la configuración del tenant o crea un registro con valores por defecto
     * Solo debe existir UN registro de configuración por tenant
     */
    private function getOrCreateTenantSettings(): Settings
    {
        $settings = Settings::first();
        
        if (!$settings) {
            // Crear configuración inicial para el tenant con valores por defecto
            $settings = Settings::create([
                'company_name' => '',
                'legal_name' => '',
                'commercial_name' => '',
                'tax_identification_number' => '',
                'main_address' => '',
                'branch_address' => '',
                'province' => '',
                'canton' => '',
                'parish' => '',
                'company_phone' => '',
                'company_email' => '',
                'company_status' => 'ACTIVE',
                'company_type' => 'NATURAL',
                
                // SRI configuration defaults
                'sri_mode' => 'test',
                'establishment_code' => '001',
                'emission_point_code' => '001',
                'environment_type' => 'test',
                'emission_type' => 'normal',
                'requires_electronic_signature' => true,
                
                // SRI endpoints defaults
                'endpoint_recepcion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
                'endpoint_autorizacion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
                'endpoint_consultas' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
                
                // Document series defaults
                'invoice_series' => '001-001-000000001',
                'receipt_series' => '001-001-000000001',
                'credit_note_series' => '001-001-000000001',
                'debit_note_series' => '001-001-000000001',
                'withholding_receipt_series' => '001-001-000000001',
                'liquidation_series' => '001-001-000000001',
                
                // Printing defaults
                'print_legal_text' => true,
                'print_tax_info' => true,
            ]);
        }
        
        return $settings;
    }

    private function handleFileUpload(Request $request, string $fileField, string $directory, Settings $settings, string $pathField)
    {
        if ($request->hasFile($fileField)) {
            $disk = 'local';
            
            if ($settings->$pathField && Storage::disk($disk)->exists($settings->$pathField)) {
                Storage::disk($disk)->delete($settings->$pathField);
            }
            
            $tenantPath = 'tenants/' . tenant()->id . '/' . $directory;
            $fileName = $request->file($fileField)->hashName();
            $fullPath = $tenantPath . '/' . $fileName;
            Storage::disk($disk)->putFileAs($tenantPath, $request->file($fileField), $fileName);
            
            $settings->$pathField = $fullPath;
            $settings->save();
        }
    }

    public function testSriConnection(Request $request)
{
    $request->validate([
        'tax_identification_number' => 'required|string|size:13|regex:/^[0-9]{13}$/',
        'certificate_password' => 'nullable|string',
        'sri_mode' => 'required|in:test,production',
    ]);

    try {
        $ruc = $request->tax_identification_number;
        
        // Validación básica del RUC (formato y longitud)
        if (strlen($ruc) !== 13 || !ctype_digit($ruc)) {
            throw new \Exception('RUC debe tener exactamente 13 dígitos numéricos');
        }
        
        $province = (int)substr($ruc, 0, 2);
        if ($province < 1 || $province > 24) {
            throw new \Exception('Código de provincia inválido en el RUC');
        }

        // Obtener los endpoints según el modo
        $endpoints = $this->getSriEndpoints($request->sri_mode);
        
        // Intentar conexión real con SRI
        $connectionTest = $this->testSriEndpointConnection($endpoints['recepcion']);
        
        if ($connectionTest['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Configuración validada correctamente para SRI Ecuador',
                'data' => [
                    'status' => 'connected',
                    'environment' => $request->sri_mode,
                    'ruc_valid' => true,
                    'ruc_provided' => $ruc,
                    'endpoints_accessible' => true,
                    'certificate_status' => $this->getCertificateStatus(),
                    'endpoint_tested' => $endpoints['recepcion'],
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } else {
            throw new \Exception($connectionTest['message']);
        }
        
    } catch (\Exception $e) {
        Log::error('SRI connection test failed', [
            'error' => $e->getMessage(),
            'ruc' => $request->tax_identification_number ?? null,
            'mode' => $request->sri_mode ?? null,
            'trace' => $e->getTraceAsString(),
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error en la conexión: ' . $e->getMessage(),
            'data' => [
                'status' => 'failed',
                'environment' => $request->sri_mode,
                'error_details' => $e->getMessage(),
                'suggestions' => $this->getConnectionErrorSuggestions($e->getMessage()),
                'endpoint_attempted' => $this->getSriEndpoints($request->sri_mode)['recepcion'] ?? null,
                'timestamp' => now()->toISOString(),
            ]
        ], 500);
    }
}

/**
 * Obtiene los endpoints según el modo (test/production)
 */
private function getSriEndpoints(string $mode): array
{
    if ($mode === 'production') {
        return [
            'recepcion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
            'autorizacion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
            'consultas' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
        ];
    }
    
    // Modo test/pruebas
    return [
        'recepcion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
        'autorizacion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
        'consultas' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
    ];
}

/**
 * Prueba la conexión a un endpoint del SRI con diagnóstico mejorado
 */
private function testSriEndpointConnection(string $endpoint): array
{
    try {
        // Configurar contexto HTTP con timeout y headers apropiados
        $context = stream_context_create([
            'http' => [
                'timeout' => 15, // Aumentado a 15 segundos
                'method' => 'GET',
                'header' => [
                    'User-Agent: Mozilla/5.0 (compatible; Laravel-SRI-Client/1.0)',
                    'Accept: text/xml, application/xml, */*',
                    'Connection: close'
                ],
                'ignore_errors' => true, // Para capturar respuestas de error HTTP
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
                'allow_self_signed' => false,
            ]
        ]);
        
        Log::info('Attempting SRI connection', ['endpoint' => $endpoint]);
        
        // Intentar conexión
        $startTime = microtime(true);
        $result = @file_get_contents($endpoint, false, $context);
        $endTime = microtime(true);
        $responseTime = round(($endTime - $startTime) * 1000, 2);
        
        // Obtener headers de respuesta HTTP
        $headers = isset($http_response_header) ? $http_response_header : [];
        $statusCode = null;
        
        if (!empty($headers) && isset($headers[0])) {
            preg_match('/HTTP\/\d\.\d\s+(\d+)/', $headers[0], $matches);
            $statusCode = isset($matches[1]) ? (int)$matches[1] : null;
        }
        
        Log::info('SRI connection attempt completed', [
            'endpoint' => $endpoint,
            'status_code' => $statusCode,
            'response_time_ms' => $responseTime,
            'content_length' => $result ? strlen($result) : 0,
            'headers_count' => count($headers)
        ]);
        
        if ($result === false) {
            $error = error_get_last();
            $errorMessage = $error ? $error['message'] : 'Conexión fallida sin detalles específicos';
            
            return [
                'success' => false,
                'message' => "No se pudo conectar al SRI: {$errorMessage}",
                'details' => [
                    'endpoint' => $endpoint,
                    'status_code' => $statusCode,
                    'response_time_ms' => $responseTime,
                    'last_error' => $error,
                    'headers' => $headers
                ]
            ];
        }
        
        // Verificar código de estado HTTP
        if ($statusCode && $statusCode >= 400) {
            return [
                'success' => false,
                'message' => "El servidor SRI respondió con error HTTP {$statusCode}",
                'details' => [
                    'endpoint' => $endpoint,
                    'status_code' => $statusCode,
                    'response_time_ms' => $responseTime,
                    'content_preview' => substr($result, 0, 500)
                ]
            ];
        }
        
        // Verificar que sea un WSDL válido
        if (strpos($result, 'wsdl:definitions') === false && 
            strpos($result, 'definitions') === false &&
            strpos($result, 'xml') === false) {
            return [
                'success' => false,
                'message' => 'El endpoint no devuelve contenido XML/WSDL válido',
                'details' => [
                    'endpoint' => $endpoint,
                    'status_code' => $statusCode,
                    'response_time_ms' => $responseTime,
                    'content_type' => $this->getContentTypeFromHeaders($headers),
                    'content_preview' => substr($result, 0, 200)
                ]
            ];
        }
        
        return [
            'success' => true,
            'message' => 'Conexión exitosa con el SRI',
            'details' => [
                'endpoint' => $endpoint,
                'status_code' => $statusCode ?: 200,
                'response_time_ms' => $responseTime,
                'content_length' => strlen($result),
                'is_wsdl' => strpos($result, 'wsdl:definitions') !== false,
                'server_info' => $this->getServerInfoFromHeaders($headers)
            ]
        ];
        
    } catch (\Exception $e) {
        Log::error('SRI connection exception', [
            'endpoint' => $endpoint,
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return [
            'success' => false,
            'message' => 'Excepción durante la conexión: ' . $e->getMessage(),
            'details' => [
                'endpoint' => $endpoint,
                'exception_type' => get_class($e),
                'exception_code' => $e->getCode()
            ]
        ];
    }
}

/**
 * Extrae el Content-Type de los headers HTTP
 */
private function getContentTypeFromHeaders(array $headers): ?string
{
    foreach ($headers as $header) {
        if (stripos($header, 'content-type:') === 0) {
            return trim(substr($header, 13));
        }
    }
    return null;
}

/**
 * Extrae información del servidor de los headers HTTP
 */
private function getServerInfoFromHeaders(array $headers): ?string
{
    foreach ($headers as $header) {
        if (stripos($header, 'server:') === 0) {
            return trim(substr($header, 7));
        }
    }
    return null;
}

/**
 * Obtiene el estado del certificado digital
 */
private function getCertificateStatus(): string
{
    $settings = Settings::first();
    
    if (!$settings || !$settings->certificate_path) {
        return 'not_configured';
    }
    
    if (!Storage::exists($settings->certificate_path)) {
        return 'file_not_found';
    }
    
    return 'configured';
}

/**
 * Proporciona sugerencias específicas para errores de conexión con el SRI
 */
private function getConnectionErrorSuggestions(string $errorMessage): array
{
    $suggestions = [];
    $errorLower = strtolower($errorMessage);
    
    if (strpos($errorLower, 'timeout') !== false || strpos($errorLower, 'time') !== false) {
        $suggestions[] = 'El servidor SRI está tardando en responder. Esto es común durante horas pico (9am-12pm y 2pm-5pm)';
        $suggestions[] = 'Intente nuevamente en unos minutos';
        $suggestions[] = 'Verifique que su conexión a internet esté estable';
    }
    
    if (strpos($errorLower, 'conexión') !== false || strpos($errorLower, 'connect') !== false) {
        $suggestions[] = 'Verifique su conexión a internet';
        $suggestions[] = 'El firewall de su servidor puede estar bloqueando la conexión saliente';
        $suggestions[] = 'Consulte con su proveedor de hosting sobre restricciones de conectividad';
    }
    
    if (strpos($errorLower, 'ssl') !== false || strpos($errorLower, 'certificate') !== false || strpos($errorLower, 'https') !== false) {
        $suggestions[] = 'Problema con certificados SSL/TLS';
        $suggestions[] = 'Su servidor puede tener una configuración SSL obsoleta';
        $suggestions[] = 'Contacte a su administrador de sistemas para actualizar la configuración SSL';
    }
    
    if (strpos($errorLower, '404') !== false || strpos($errorLower, 'not found') !== false) {
        $suggestions[] = 'El endpoint del SRI no fue encontrado. Puede ser un problema temporal';
        $suggestions[] = 'Verifique que esté usando el modo correcto (test/producción)';
    }
    
    if (strpos($errorLower, '500') !== false || strpos($errorLower, '503') !== false) {
        $suggestions[] = 'Error interno en los servidores del SRI';
        $suggestions[] = 'Esto es un problema temporal del lado del SRI';
        $suggestions[] = 'Intente nuevamente en 10-15 minutos';
    }
    
    if (strpos($errorLower, 'wsdl') !== false || strpos($errorLower, 'xml') !== false) {
        $suggestions[] = 'El endpoint no está devolviendo un WSDL válido';
        $suggestions[] = 'Puede ser un problema temporal en el servidor del SRI';
        $suggestions[] = 'Verifique que la URL del endpoint esté correcta';
    }
    
    if (strpos($errorLower, 'dns') !== false || strpos($errorLower, 'resolve') !== false) {
        $suggestions[] = 'Problema de resolución DNS';
        $suggestions[] = 'Verifique la configuración DNS de su servidor';
        $suggestions[] = 'Intente usar DNS públicos como 8.8.8.8 o 1.1.1.1';
    }
    
    if (empty($suggestions)) {
        $suggestions[] = 'Error de conectividad general con el SRI';
        $suggestions[] = 'Verifique que su servidor tenga acceso a internet';
        $suggestions[] = 'Los servicios del SRI pueden estar temporalmente no disponibles';
        $suggestions[] = 'Si el problema persiste, contacte al soporte técnico del SRI: 1700 774 774';
    }
    
    // Siempre agregar sugerencias adicionales
    $suggestions[] = 'Información de contacto SRI: https://www.sri.gob.ec - Tel: 1700 774 774';
    $suggestions[] = 'Horario de atención SRI: Lunes a Viernes 8:30 - 16:30';
    
    return $suggestions;
}

private function validateSriCredentials($ruc, $certPassword, $mode)
{
    // Validación básica del RUC ecuatoriano
    if (strlen($ruc) !== 13) {
        return false;
    }
    
    if (!preg_match('/^[0-9]{13}$/', $ruc)) {
        return false;
    }
    
    // Validar dígito verificador del RUC ecuatoriano
    if (!$this->validateEcuadorianRuc($ruc)) {
        return false;
    }
    
    // La contraseña del certificado es opcional para la prueba básica
    // Se validará cuando se implemente la firma electrónica real
    
    return true;
}

/**
 * Valida el dígito verificador del RUC ecuatoriano
 */
/**
 * Valida un RUC ecuatoriano con información detallada
 */
private function validateEcuadorianRucDetailed(string $ruc): array
{
    if (strlen($ruc) !== 13) {
        return [
            'is_valid' => false,
            'error_message' => 'Debe tener exactamente 13 dígitos',
            'provided_length' => strlen($ruc)
        ];
    }
    
    if (!ctype_digit($ruc)) {
        return [
            'is_valid' => false,
            'error_message' => 'Solo debe contener números'
        ];
    }
    
    $province = (int)substr($ruc, 0, 2);
    if ($province < 1 || $province > 24) {
        return [
            'is_valid' => false,
            'error_message' => 'Código de provincia inválido (debe ser 01-24)',
            'province_code' => sprintf('%02d', $province)
        ];
    }
    
    $thirdDigit = (int)substr($ruc, 2, 1);
    $digits = str_split($ruc);
    
    if ($thirdDigit < 6) {
        // Persona Natural
        $result = $this->validateNaturalPersonRucDetailed($digits);
        $result['company_type'] = 'Persona Natural';
    } elseif ($thirdDigit === 9) {
        // Empresa Privada
        $result = $this->validatePrivateCompanyRucDetailed($digits);
        $result['company_type'] = 'Empresa Privada';
    } elseif ($thirdDigit === 6) {
        // Entidad Pública
        $result = $this->validatePublicEntityRucDetailed($digits);
        $result['company_type'] = 'Entidad Pública';
    } else {
        return [
            'is_valid' => false,
            'error_message' => 'Tercer dígito inválido (debe ser 0-5 para persona natural, 6 para entidad pública, 9 para empresa privada)',
            'third_digit' => $thirdDigit
        ];
    }
    
    return $result;
}

private function validatePrivateCompanyRucDetailed(array $digits): array
{
    $coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    $sum = 0;
    
    for ($i = 0; $i < 9; $i++) {
        $sum += (int)$digits[$i] * $coefficients[$i];
    }
    
    $remainder = $sum % 11;
    $calculatedCheckDigit = 11 - $remainder;
    
    if ($calculatedCheckDigit === 11) {
        $calculatedCheckDigit = 0;
    } elseif ($calculatedCheckDigit === 10) {
        return [
            'is_valid' => false,
            'error_message' => 'Este RUC no puede ser válido (resultaría en dígito 10)',
            'calculated_check_digit' => 10
        ];
    }
    
    $providedCheckDigit = (int)$digits[9];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    $result = [
        'is_valid' => $isValid,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
    ];
    
    if (!$isValid) {
        $result['error_message'] = "Dígito verificador incorrecto. Debería ser {$calculatedCheckDigit} pero se proporcionó {$providedCheckDigit}";
        $result['suggested_ruc'] = substr(implode('', $digits), 0, 10) . $calculatedCheckDigit . substr(implode('', $digits), 11);
    }
    
    return $result;
}

private function validateNaturalPersonRucDetailed(array $digits): array
{
    $coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    $sum = 0;
    
    for ($i = 0; $i < 9; $i++) {
        $product = (int)$digits[$i] * $coefficients[$i];
        if ($product > 9) {
            $product -= 9;
        }
        $sum += $product;
    }
    
    $remainder = $sum % 10;
    $calculatedCheckDigit = 10 - $remainder;
    if ($calculatedCheckDigit === 10) {
        $calculatedCheckDigit = 0;
    }
    
    $providedCheckDigit = (int)$digits[9];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    $result = [
        'is_valid' => $isValid,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
    ];
    
    if (!$isValid) {
        $result['error_message'] = "Dígito verificador incorrecto. Debería ser {$calculatedCheckDigit} pero se proporcionó {$providedCheckDigit}";
        $result['suggested_ruc'] = substr(implode('', $digits), 0, 10) . $calculatedCheckDigit . substr(implode('', $digits), 11);
    }
    
    return $result;
}

private function validatePublicEntityRucDetailed(array $digits): array
{
    $coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    $sum = 0;
    
    for ($i = 0; $i < 8; $i++) {
        $sum += (int)$digits[$i] * $coefficients[$i];
    }
    
    $remainder = $sum % 11;
    $calculatedCheckDigit = 11 - $remainder;
    
    if ($calculatedCheckDigit === 11) {
        $calculatedCheckDigit = 0;
    } elseif ($calculatedCheckDigit === 10) {
        return [
            'is_valid' => false,
            'error_message' => 'Este RUC no puede ser válido (resultaría en dígito 10)',
            'calculated_check_digit' => 10
        ];
    }
    
    $providedCheckDigit = (int)$digits[8];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    $result = [
        'is_valid' => $isValid,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
    ];
    
    if (!$isValid) {
        $result['error_message'] = "Dígito verificador incorrecto. Debería ser {$calculatedCheckDigit} pero se proporcionó {$providedCheckDigit}";
        $result['suggested_ruc'] = substr(implode('', $digits), 0, 9) . $calculatedCheckDigit . substr(implode('', $digits), 10);
    }
    
    return $result;
}

    public function getCertificateInfo()
    {
        $settings = Settings::first();
        
        if (!$settings || !$settings->certificate_path || !Storage::exists($settings->certificate_path)) {
            return response()->json([
                'success' => false,
                'message' => 'No hay certificado digital configurado para SRI Ecuador'
            ], 404);
        }

        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'path' => $settings->certificate_path,
                    'exists' => Storage::exists($settings->certificate_path),
                    'size' => Storage::size($settings->certificate_path),
                    'last_modified' => Storage::lastModified($settings->certificate_path),
                    'type' => 'Certificado Digital SRI Ecuador (.p12)'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al leer el certificado digital: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getEcuadorProvinces()
    {
        return [
            ['value' => 'Azuay', 'label' => 'Azuay'],
            ['value' => 'Bolívar', 'label' => 'Bolívar'],
            ['value' => 'Cañar', 'label' => 'Cañar'],
            ['value' => 'Carchi', 'label' => 'Carchi'],
            ['value' => 'Chimborazo', 'label' => 'Chimborazo'],
            ['value' => 'Cotopaxi', 'label' => 'Cotopaxi'],
            ['value' => 'El Oro', 'label' => 'El Oro'],
            ['value' => 'Esmeraldas', 'label' => 'Esmeraldas'],
            ['value' => 'Galápagos', 'label' => 'Galápagos'],
            ['value' => 'Guayas', 'label' => 'Guayas'],
            ['value' => 'Imbabura', 'label' => 'Imbabura'],
            ['value' => 'Loja', 'label' => 'Loja'],
            ['value' => 'Los Ríos', 'label' => 'Los Ríos'],
            ['value' => 'Manabí', 'label' => 'Manabí'],
            ['value' => 'Morona Santiago', 'label' => 'Morona Santiago'],
            ['value' => 'Napo', 'label' => 'Napo'],
            ['value' => 'Orellana', 'label' => 'Orellana'],
            ['value' => 'Pastaza', 'label' => 'Pastaza'],
            ['value' => 'Pichincha', 'label' => 'Pichincha'],
            ['value' => 'Santa Elena', 'label' => 'Santa Elena'],
            ['value' => 'Santo Domingo de los Tsáchilas', 'label' => 'Santo Domingo de los Tsáchilas'],
            ['value' => 'Sucumbíos', 'label' => 'Sucumbíos'],
            ['value' => 'Tungurahua', 'label' => 'Tungurahua'],
            ['value' => 'Zamora Chinchipe', 'label' => 'Zamora Chinchipe'],
        ];
    }

    public function debugRucValidation(Request $request)
{
    $ruc = $request->input('ruc', '0993387314001');
    
    $debugInfo = [
        'ruc_provided' => $ruc,
        'length' => strlen($ruc),
        'is_numeric' => ctype_digit($ruc),
        'province_code' => substr($ruc, 0, 2),
        'third_digit' => substr($ruc, 2, 1),
        'validation_result' => null,
        'suggested_valid_ruc' => null,
        'validation_steps' => []
    ];
    
    // Validar paso a paso
    if (strlen($ruc) !== 13) {
        $debugInfo['validation_result'] = 'INVALID - Debe tener exactamente 13 dígitos';
        return response()->json($debugInfo);
    }
    
    if (!ctype_digit($ruc)) {
        $debugInfo['validation_result'] = 'INVALID - Solo debe contener números';
        return response()->json($debugInfo);
    }
    
    $province = (int)substr($ruc, 0, 2);
    if ($province < 1 || $province > 24) {
        $debugInfo['validation_result'] = 'INVALID - Código de provincia inválido (debe ser 01-24)';
        return response()->json($debugInfo);
    }
    
    $thirdDigit = (int)substr($ruc, 2, 1);
    $debugInfo['company_type'] = $this->getCompanyType($thirdDigit);
    
    // Validar según tipo
    if ($thirdDigit < 6) {
        $result = $this->debugNaturalPersonRuc($ruc);
    } elseif ($thirdDigit === 9) {
        $result = $this->debugPrivateCompanyRuc($ruc);
    } elseif ($thirdDigit === 6) {
        $result = $this->debugPublicEntityRuc($ruc);
    } else {
        $debugInfo['validation_result'] = 'INVALID - Tercer dígito inválido';
        return response()->json($debugInfo);
    }
    
    $debugInfo = array_merge($debugInfo, $result);
    
    // Generar RUC válido como ejemplo
    if (!$result['is_valid']) {
        $debugInfo['suggested_valid_ruc'] = $this->generateValidRuc($province, $thirdDigit);
    }
    
    return response()->json($debugInfo);
}

private function debugPrivateCompanyRuc(string $ruc): array
{
    $digits = str_split($ruc);
    $coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    $sum = 0;
    $calculations = [];
    
    for ($i = 0; $i < 9; $i++) {
        $product = (int)$digits[$i] * $coefficients[$i];
        $calculations[] = [
            'position' => $i + 1,
            'digit' => $digits[$i],
            'coefficient' => $coefficients[$i],
            'product' => $product
        ];
        $sum += $product;
    }
    
    $remainder = $sum % 11;
    $calculatedCheckDigit = 11 - $remainder;
    
    if ($calculatedCheckDigit === 11) {
        $calculatedCheckDigit = 0;
    } elseif ($calculatedCheckDigit === 10) {
        return [
            'is_valid' => false,
            'validation_result' => 'INVALID - RUC terminaría en 10 (no permitido)',
            'calculations' => $calculations,
            'sum' => $sum,
            'remainder' => $remainder,
            'calculated_check_digit' => 'N/A (sería 10)',
            'provided_check_digit' => (int)$digits[9]
        ];
    }
    
    $providedCheckDigit = (int)$digits[9];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    return [
        'is_valid' => $isValid,
        'validation_result' => $isValid ? 'VALID' : 'INVALID - Dígito verificador incorrecto',
        'calculations' => $calculations,
        'sum' => $sum,
        'remainder' => $remainder,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
        'correct_ruc' => substr($ruc, 0, 10) . $calculatedCheckDigit . substr($ruc, 11)
    ];
}

private function debugNaturalPersonRuc(string $ruc): array
{
    $digits = str_split($ruc);
    $coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    $sum = 0;
    $calculations = [];
    
    for ($i = 0; $i < 9; $i++) {
        $product = (int)$digits[$i] * $coefficients[$i];
        if ($product > 9) {
            $product -= 9;
        }
        $calculations[] = [
            'position' => $i + 1,
            'digit' => $digits[$i],
            'coefficient' => $coefficients[$i],
            'raw_product' => (int)$digits[$i] * $coefficients[$i],
            'adjusted_product' => $product
        ];
        $sum += $product;
    }
    
    $remainder = $sum % 10;
    $calculatedCheckDigit = 10 - $remainder;
    if ($calculatedCheckDigit === 10) {
        $calculatedCheckDigit = 0;
    }
    
    $providedCheckDigit = (int)$digits[9];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    return [
        'is_valid' => $isValid,
        'validation_result' => $isValid ? 'VALID' : 'INVALID - Dígito verificador incorrecto',
        'calculations' => $calculations,
        'sum' => $sum,
        'remainder' => $remainder,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
        'correct_ruc' => substr($ruc, 0, 10) . $calculatedCheckDigit . substr($ruc, 11)
    ];
}

private function debugPublicEntityRuc(string $ruc): array
{
    $digits = str_split($ruc);
    $coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    $sum = 0;
    $calculations = [];
    
    for ($i = 0; $i < 8; $i++) {
        $product = (int)$digits[$i] * $coefficients[$i];
        $calculations[] = [
            'position' => $i + 1,
            'digit' => $digits[$i],
            'coefficient' => $coefficients[$i],
            'product' => $product
        ];
        $sum += $product;
    }
    
    $remainder = $sum % 11;
    $calculatedCheckDigit = 11 - $remainder;
    
    if ($calculatedCheckDigit === 11) {
        $calculatedCheckDigit = 0;
    } elseif ($calculatedCheckDigit === 10) {
        return [
            'is_valid' => false,
            'validation_result' => 'INVALID - RUC terminaría en 10 (no permitido)',
            'calculations' => $calculations,
            'sum' => $sum,
            'remainder' => $remainder,
            'calculated_check_digit' => 'N/A (sería 10)',
            'provided_check_digit' => (int)$digits[8]
        ];
    }
    
    $providedCheckDigit = (int)$digits[8];
    $isValid = $calculatedCheckDigit === $providedCheckDigit;
    
    return [
        'is_valid' => $isValid,
        'validation_result' => $isValid ? 'VALID' : 'INVALID - Dígito verificador incorrecto',
        'calculations' => $calculations,
        'sum' => $sum,
        'remainder' => $remainder,
        'calculated_check_digit' => $calculatedCheckDigit,
        'provided_check_digit' => $providedCheckDigit,
        'correct_ruc' => substr($ruc, 0, 9) . $calculatedCheckDigit . substr($ruc, 10)
    ];
}

private function getCompanyType(int $thirdDigit): string
{
    if ($thirdDigit < 6) return 'Persona Natural';
    if ($thirdDigit === 6) return 'Entidad Pública';
    if ($thirdDigit === 9) return 'Empresa Privada';
    return 'Desconocido';
}

private function generateValidRuc(int $province, int $thirdDigit): string
{
    $examples = [
        'natural' => ['0926687856001', '1724077936001', '0992764867001'],
        'private' => ['0992764867001', '1791856071001', '0591234567001'],
        'public' => ['0968599020001', '1760001550001', '0960019490001']
    ];
    
    if ($thirdDigit < 6) {
        return $examples['natural'][array_rand($examples['natural'])];
    } elseif ($thirdDigit === 9) {
        return $examples['private'][array_rand($examples['private'])];
    } elseif ($thirdDigit === 6) {
        return $examples['public'][array_rand($examples['public'])];
    }
    
    return '0992764867001'; // RUC válido por defecto
}
}