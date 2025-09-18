<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Settings extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_name',
        'company_logo',
        'company_address',
        'company_phone',
        'company_email',
        'company_tax_id',
        'currency',
        'timezone',
        
        // SRI Ecuador fields
        'tax_identification_number', // RUC (13 dígitos)
        'legal_name',
        'commercial_name',
        'company_status',
        'company_type',
        'main_address',
        'branch_address',
        'province',
        'canton',
        'parish',
        'establishment_code',
        'emission_point_code',
        'registration_date',
        'accounting_system',
        'economic_activity_code',
        'secondary_economic_activities',
        'tax_responsibility_code',
        'tax_responsibilities',
        'special_taxpayer_number',
        'special_taxpayer_date',
        'withholding_agent_number',
        'withholding_agent_date',
        'electronic_document_system',
        
        // SRI credentials fields
        'sri_mode',
        'certificate_path',
        'certificate_password',
        'electronic_signature',
        'environment_type',
        'emission_type',
        'requires_electronic_signature',
        
        // Endpoints SRI
        'endpoint_recepcion',
        'endpoint_autorizacion',
        'endpoint_consultas',
        
        // Document series
        'invoice_series',
        'receipt_series',
        'credit_note_series',
        'debit_note_series',
        'withholding_receipt_series',
        'liquidation_series',
        
        // Printing/display settings
        'logo_path',
        'report_header',
        'report_footer',
        'invoice_footer',
        'receipt_footer',
        'note_footer',
        'print_legal_text',
        'print_tax_info',
    ];
 
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'registration_date' => 'date',
        'special_taxpayer_date' => 'date',
        'withholding_agent_date' => 'date',
        'secondary_economic_activities' => 'array',
        'tax_responsibilities' => 'array',
        'print_legal_text' => 'boolean',
        'print_tax_info' => 'boolean',
        'requires_electronic_signature' => 'boolean',
    ];

    protected $hidden = [
        'certificate_password',
        'electronic_signature',
    ];

    /**
     * Get the default document series configuration
     */
    public function getDefaultDocumentSeries(): array
    {
        return [
            'invoice' => '001-001-000000001',
            'receipt' => '001-001-000000001',
            'credit_note' => '001-001-000000001',
            'debit_note' => '001-001-000000001',
            'withholding_receipt' => '001-001-000000001',
            'liquidation' => '001-001-000000001',
        ];
    }

    /**
     * Check if SRI credentials are configured
     */
    public function hasSriCredentials(): bool
    {
        return !empty($this->tax_identification_number) && 
               !empty($this->certificate_path) && 
               !empty($this->electronic_signature);
    }

    /**
     * Get the certificate path for the tenant
     */
    public function getCertificatePathAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        // Default path for tenant certificate
        return storage_path("app/tenants/" . tenant()->id . "/certificate.p12");
    }

    /**
     * Get the logo path for the tenant
     */
    public function getLogoPathAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        // Default path for tenant logo
        return storage_path("app/tenants/" . tenant()->id . "/logo.png");
    }

    /**
     * Decrypt certificate_password when accessing
     */
    public function getCertificatePasswordAttribute($value)
    {
        if (empty($value)) {
            return $value;
        }
        
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    /**
     * Encrypt certificate_password when setting
     */
    public function setCertificatePasswordAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['certificate_password'] = $value;
            return;
        }
        
        try {
            Crypt::decryptString($value);
            $this->attributes['certificate_password'] = $value;
        } catch (\Exception $e) {
            $this->attributes['certificate_password'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt electronic_signature when accessing
     */
    public function getElectronicSignatureAttribute($value)
    {
        if (empty($value)) {
            return $value;
        }
        
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    /**
     * Encrypt electronic_signature when setting
     */
    public function setElectronicSignatureAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['electronic_signature'] = $value;
            return;
        }
        
        try {
            Crypt::decryptString($value);
            $this->attributes['electronic_signature'] = $value;
        } catch (\Exception $e) {
            $this->attributes['electronic_signature'] = Crypt::encryptString($value);
        }
    }

    /**
     * Get the establishment and emission point codes
     */
    public function getEstablishmentInfo(): array
    {
        return [
            'establishment_code' => $this->establishment_code ?? '001',
            'emission_point_code' => $this->emission_point_code ?? '001',
        ];
    }

    /**
     * Get SRI endpoints based on environment
     */
    public function getSriEndpoints(): array
    {
        $mode = $this->sri_mode ?? 'test';
        
        if ($mode === 'production') {
            return [
                'recepcion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
                'autorizacion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
                'consultas' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
            ];
        }
        
        // Test environment
        return [
            'recepcion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
            'autorizacion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
            'consultas' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl',
        ];
    }
}