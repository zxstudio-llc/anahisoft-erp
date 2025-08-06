<?php

namespace App\Http\Services\Tenant;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ValidateDocumentPeru
{
    private string $token;
    private string $base_url;

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        $this->token = env('APIS_PERU_TOKEN', '');
        $this->base_url = env('APIS_PERU_BASE_URL', 'https://dniruc.apisperu.com/api/v1');
    }

    /**
     * Validates a Peruvian DNI number
     * 
     * @param string $dni DNI number to validate
     * @return array Person data or error message
     */
    public function validate_dni(string $dni): array
    {
        // Basic validation
        if (strlen($dni) !== 8 || !is_numeric($dni)) {
            return [
                'success' => false,
                'message' => 'DNI must have 8 numeric digits'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->token
            ])->get("{$this->base_url}/dni/{$dni}");

            if ($response->successful()) {
                if ($response->json()['success'] == false) {
                    return [
                        'success' => false,
                        'message' => 'The DNI is invalid or does not exist. Please check the DNI number.'
                    ];
                }

                $data = $response->json();
                return [
                    'success' => true,
                    'data' => [
                        'dni' => $data['dni'],
                        'firstName' => $data['nombres'],
                        'lastName' => $data['apellidoPaterno'],
                        'motherLastName' => $data['apellidoMaterno'],
                        'verificationCode' => $data['codVerifica'],
                        'verificationLetter' => $data['codVerificaLetra']
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'Could not validate DNI',
                'error' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('Error validating DNI: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error connecting to validation service'
            ];
        }
    }

    /**
     * Validates a Peruvian RUC number
     * 
     * @param string $ruc RUC number to validate
     * @return array Company data or error message
     */
    public function validate_ruc(string $ruc): array
    {
        // Basic validation
        if (strlen($ruc) !== 11 || !is_numeric($ruc)) {
            return [
                'success' => false,
                'message' => 'RUC must have 11 numeric digits'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->token
            ])->get("{$this->base_url}/ruc/{$ruc}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => [
                        'ruc' => $data['ruc'],
                        'businessName' => $data['razonSocial'],
                        'tradeName' => $data['nombreComercial'],
                        'phones' => $data['telefonos'],
                        'type' => $data['tipo'],
                        'status' => $data['estado'],
                        'condition' => $data['condicion'],
                        'address' => $data['direccion'],
                        'department' => $data['departamento'],
                        'province' => $data['provincia'],
                        'district' => $data['distrito'],
                        'registrationDate' => $data['fechaInscripcion'],
                        'emissionSystem' => $data['sistEmsion'],
                        'accountingSystem' => $data['sistContabilidad'],
                        'foreignActivity' => $data['actExterior'],
                        'economicActivities' => $data['actEconomicas'],
                        'paymentVouchers' => $data['cpPago'],
                        'electronicSystems' => $data['sistElectronica'],
                        'electronicEmissionDate' => $data['fechaEmisorFe'],
                        'electronicVouchers' => $data['cpeElectronico'],
                        'pleDate' => $data['fechaPle'],
                        'registers' => $data['padrones'],
                        'withdrawalDate' => $data['fechaBaja'],
                        'profession' => $data['profesion'],
                        'ubigeo' => $data['ubigeo'],
                        'capital' => $data['capital']
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'Could not validate RUC',
                'error' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('Error validating RUC: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error connecting to validation service'
            ];
        }
    }
}
