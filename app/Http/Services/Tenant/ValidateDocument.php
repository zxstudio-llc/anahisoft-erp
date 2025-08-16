<?php

namespace App\Http\Services\Tenant;

use App\Http\Services\SriService;
use Illuminate\Support\Facades\Log;

class ValidateDocument
{
    private SriService $sriService;

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        $this->sriService = new SriService();
    }

    /**
     * Validates an Ecuadorian RUC number
     * 
     * @param string $ruc RUC number to validate (13 digits)
     * @return array Company data or error message
     */
    public function validate_ruc(string $ruc): array
    {
        // Basic validation for Ecuadorian RUC (13 digits)
        if (strlen($ruc) !== 13 || !ctype_digit($ruc)) {
            return [
                'success' => false,
                'message' => 'El RUC debe tener exactamente 13 dígitos numéricos'
            ];
        }

        // Validate RUC format (first two digits 01-24, third digit 0-6 or 9)
        $provinceCode = substr($ruc, 0, 2);
        $thirdDigit = $ruc[2];
        
        if ($provinceCode < '01' || $provinceCode > '24') {
            return [
                'success' => false,
                'message' => 'Los primeros dos dígitos del RUC deben corresponder a una provincia válida de Ecuador (01-24)'
            ];
        }

        if (!in_array($thirdDigit, ['0', '1', '2', '3', '4', '5', '6', '9'])) {
            return [
                'success' => false,
                'message' => 'El tercer dígito del RUC no es válido para Ecuador'
            ];
        }

        try {
            // Get RUC data from SRI service
            $rucData = $this->sriService->getRucData($ruc);
            
            // Check if the RUC exists and is active
            if (empty($rucData['contributor']['identification'])) {
                return [
                    'success' => false,
                    'message' => 'El RUC no existe o no se encontró información en el SRI'
                ];
            }

            // Check if the RUC is active
            $status = $rucData['contributor']['status'] ?? null;
            if ($status !== 'ACTIVO') {
                return [
                    'success' => false,
                    'message' => 'El RUC no está activo en el SRI. Estado actual: ' . $status
                ];
            }

            // Return formatted success response
            return [
                'success' => true,
                'data' => [
                    'ruc' => $rucData['contributor']['identification'],
                    'businessName' => $rucData['contributor']['business_name'],
                    'tradeName' => $rucData['contributor']['trade_name'],
                    'legalName' => $rucData['ruc_info']['legal_name'],
                    'status' => $rucData['ruc_info']['status'],
                    'taxpayerType' => $rucData['ruc_info']['taxpayer_type'],
                    'mainActivity' => $rucData['ruc_info']['main_activity'],
                    'address' => $rucData['contributor']['head_office_address'],
                    'establishments' => $rucData['ruc_info']['establishments'],
                    'startDate' => $rucData['ruc_info']['taxpayer_dates_information']['start_date'],
                    'accountingRequired' => $rucData['ruc_info']['accounting_required'],
                    'withholdingAgent' => $rucData['ruc_info']['withholding_agent'],
                    'specialTaxpayer' => $rucData['ruc_info']['special_taxpayer']
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Error validating RUC: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al conectar con el servicio de validación del SRI'
            ];
        }
    }

    /**
     * This method is kept for compatibility but will return an error for Ecuador
     */
    public function validate_dni(string $dni): array
    {
        return [
            'success' => false,
            'message' => 'En Ecuador se utiliza el RUC (13 dígitos) en lugar del DNI'
        ];
    }
}