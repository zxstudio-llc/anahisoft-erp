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
                
                // SRI configuration
                'sri_mode' => $settings->sri_mode ?? 'test',
                'certificate_path' => $settings->certificate_path,
                'certificate_password' => '', // Never send password for security
                'sri_user' => $settings->sri_user,
                'sri_password' => '', // Never send password for security
                'electronic_signature' => '', // Never send signature for security
                'establishment_code' => $settings->establishment_code,
                'emission_point_code' => $settings->emission_point_code,
                
                // Endpoints
                'endpoint_invoices' => $settings->endpoint_invoices,
                'endpoint_withholdings' => $settings->endpoint_withholdings,
                'endpoint_liquidations' => $settings->endpoint_liquidations,
                
                // Document series
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
            ] : [
                // Default values when no settings exist
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
                'sri_mode' => 'test',
                'certificate_path' => '',
                'certificate_password' => '',
                'sri_user' => '',
                'sri_password' => '',
                'electronic_signature' => '',
                'establishment_code' => '001',
                'emission_point_code' => '001',
                'endpoint_invoices' => '',
                'endpoint_withholdings' => '',
                'endpoint_liquidations' => '',
                'invoice_series' => '001-001-000000001',
                'receipt_series' => '001-001-000000001',
                'credit_note_series' => '001-001-000000001',
                'debit_note_series' => '001-001-000000001',
                'withholding_receipt_series' => '001-001-000000001',
                'liquidation_series' => '001-001-000000001',
                'invoice_footer' => '',
                'receipt_footer' => '',
                'note_footer' => '',
                'report_header' => '',
                'report_footer' => '',
                'print_legal_text' => true,
                'print_tax_info' => true,
            ],
            'modes' => [
                ['value' => 'test', 'label' => 'Pruebas'],
                ['value' => 'production', 'label' => 'Producción'],
            ],
            'provinces' => $this->getEcuadorProvinces(), // Helper method to get Ecuador provinces
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            // Company information
            'company_name' => 'required|string|max:255',
            'legal_name' => 'required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'tax_identification_number' => 'required|string|size:13',
            'main_address' => 'required|string|max:255',
            'branch_address' => 'nullable|string|max:255',
            'province' => 'required|string|max:255',
            'canton' => 'required|string|max:255',
            'parish' => 'required|string|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_email' => 'nullable|email|max:255',
            
            // SRI credentials
            'sri_user' => 'nullable|string|max:255',
            'sri_password' => 'nullable|string|max:255',
            'electronic_signature' => 'nullable|string',
            'sri_mode' => ['required', Rule::in(['test', 'production'])],
            'certificate_password' => 'nullable|string|max:255',
            'establishment_code' => 'required|string|size:3',
            'emission_point_code' => 'required|string|size:3',
            
            // Custom endpoints (optional)
            'endpoint_invoices' => 'nullable|url|max:255',
            'endpoint_withholdings' => 'nullable|url|max:255',
            'endpoint_liquidations' => 'nullable|url|max:255',
            
            // Document series
            'invoice_series' => 'required|string|max:17', // 001-001-000000001 format
            'receipt_series' => 'required|string|max:17',
            'credit_note_series' => 'required|string|max:17',
            'debit_note_series' => 'required|string|max:17',
            'withholding_receipt_series' => 'required|string|max:17',
            'liquidation_series' => 'required|string|max:17',
            
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
                        $allowedExtensions = ['p12', 'pfx'];
                        $extension = strtolower($value->getClientOriginalExtension());
                        
                        if (!in_array($extension, $allowedExtensions)) {
                            $fail('El certificado debe ser un archivo .p12 o .pfx');
                        }
                        
                        if ($value->getSize() > 5 * 1024 * 1024) {
                            $fail('El certificado no debe ser mayor a 5MB.');
                        }
                    }
                }
            ],
        ]);

        $settings = Settings::firstOrCreate(['id' => 1]);
        
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
        if (!empty($updateData['sri_password'])) {
            $updateData['sri_password'] = Crypt::encryptString($updateData['sri_password']);
        }
        
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
            $settings = Settings::firstOrCreate(['id' => 1]);
            
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
            $settings = Settings::firstOrCreate(['id' => 1]);
            
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
            'tax_identification_number' => 'required|string|size:13',
            'sri_user' => 'required|string',
            'sri_password' => 'required|string',
            'sri_mode' => 'required|in:test,production',
            'certificate_password' => 'required|string',
        ]);

        try {
            // Here you would implement actual SRI connection test
            // This is a mock implementation
            
            $valid = $this->validateSriCredentials(
                $request->tax_identification_number,
                $request->sri_user,
                $request->sri_password,
                $request->certificate_password,
                $request->sri_mode
            );
            
            if ($valid) {
                return response()->json([
                    'success' => true,
                    'message' => 'Conexión con SRI configurada correctamente',
                    'data' => [
                        'status' => 'connected',
                        'environment' => $request->sri_mode,
                        'timestamp' => now()->toISOString(),
                    ]
                ]);
            } else {
                throw new \Exception('Credenciales inválidas');
            }
            
        } catch (\Exception $e) {
            Log::error('SRI connection test failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al conectar con SRI: ' . $e->getMessage(),
                'data' => [
                    'status' => 'failed',
                    'environment' => $request->sri_mode,
                    'error_details' => $e->getMessage(),
                    'timestamp' => now()->toISOString(),
                ]
            ], 500);
        }
    }

    public function getCertificateInfo()
    {
        $settings = Settings::first();
        
        if (!$settings || !$settings->certificate_path || !Storage::exists($settings->certificate_path)) {
            return response()->json([
                'success' => false,
                'message' => 'No hay certificado configurado'
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
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al leer el certificado: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getEcuadorProvinces()
    {
        // This would typically come from a database or config file
        return [
            ['value' => 'Azuay', 'label' => 'Azuay'],
            ['value' => 'Bolívar', 'label' => 'Bolívar'],
            ['value' => 'Cañar', 'label' => 'Cañar'],
            // ... all other provinces
            ['value' => 'Zamora Chinchipe', 'label' => 'Zamora Chinchipe'],
        ];
    }

    private function validateSriCredentials($ruc, $user, $password, $certPassword, $mode)
    {
        // In a real implementation, this would validate against SRI's WS
        // For now, we'll just do basic validation
        
        if (strlen($ruc) !== 13) {
            return false;
        }
        
        if (empty($user) || empty($password)) {
            return false;
        }
        
        // Additional validation logic here
        
        return true;
    }
}