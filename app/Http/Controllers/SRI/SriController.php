<?php

namespace App\Http\Controllers\SRI;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Http\Services\SriService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\SRI\Sri;
use App\Exceptions\SriNotFoundException;
use App\Exceptions\SriServiceException;

class SriController extends Controller
{
    protected SriService $sriService;

    public function __construct(SriService $sriService)
    {
        $this->sriService = $sriService;
    }

    /**
     * POST /api/v1/sris/search
     * Consulta información de un contribuyente en el SRI
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $validatedData = $this->validateRequest($request);
            $identification = $validatedData['identification'];

            // Validamos que sea un RUC válido (13 dígitos)
            if (strlen($identification) !== 13) {
                return $this->errorResponse([
                    'message' => 'Solo se permiten consultas de RUC (13 dígitos)',
                    'field' => 'identification'
                ], 422);
            }

            $cacheKey = 'sri_data_'.md5($identification);
            $contribuyente = Cache::remember($cacheKey, now()->addHours(6), function() use ($identification) {
                $sriData = $this->sriService->getRucData($identification);
                return Sri::createFromApiData($sriData, $identification);
            });

            return $this->successResponse($contribuyente, $cacheKey);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (SriNotFoundException $e) {
            return $this->notFoundResponse($identification ?? '');
        } catch (SriServiceException $e) {
            return $this->serviceErrorResponse($e);
        } catch (\Exception $e) {
            return $this->serverErrorResponse($e, $request);
        }
    }

    /**
     * GET /api/v1/sris/{identification}
     * Consulta información por GET usando el RUC en la URL
     */
    public function show(Request $request, string $identification): JsonResponse
    {
        try {
            // Validar que sea un RUC válido
            if (strlen($identification) !== 13 || !ctype_digit($identification)) {
                return $this->errorResponse([
                    'message' => 'El RUC debe tener exactamente 13 dígitos',
                    'field' => 'identification'
                ], 422);
            }

            if (!$this->validateRucBasicFormat($identification)) {
                return $this->errorResponse([
                    'message' => 'El RUC no tiene un formato válido',
                    'field' => 'identification'
                ], 422);
            }

            $cacheKey = 'sri_data_'.md5($identification);
            $contribuyente = Cache::remember($cacheKey, now()->addHours(6), function() use ($identification) {
                $sriData = $this->sriService->getRucData($identification);
                return Sri::createFromApiData($sriData, $identification);
            });

            return $this->successResponse($contribuyente, $cacheKey);

        } catch (SriNotFoundException $e) {
            return $this->notFoundResponse($identification);
        } catch (SriServiceException $e) {
            return $this->serviceErrorResponse($e);
        } catch (\Exception $e) {
            return $this->serverErrorResponse($e, $request);
        }
    }

    /**
     * Valida la estructura y formato del request
     */
    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'identification' => [
                'required',
                'string',
                'size:13',
                'regex:/^[0-9]+$/',
                function ($attribute, $value, $fail) {
                    if (!$this->validateRucBasicFormat($value)) {
                        $fail('El RUC no tiene un formato válido.');
                    }
                }
            ],
        ], [
            'identification.required' => 'El RUC es obligatorio',
            'identification.size' => 'El RUC debe tener exactamente 13 dígitos',
            'identification.regex' => 'El RUC solo debe contener números',
        ]);
    }

    /**
     * Valida el formato básico de RUC ecuatoriano
     */
    private function validateRucBasicFormat(string $ruc): bool
    {
        // Los primeros dos dígitos deben ser válidos para Ecuador (01-24)
        $provinceCode = substr($ruc, 0, 2);
        if ($provinceCode < '01' || $provinceCode > '24') {
            return false;
        }

        // El tercer dígito debe ser entre 0 y 6 o 9
        $thirdDigit = $ruc[2];
        return in_array($thirdDigit, ['0', '1', '2', '3', '4', '5', '6', '9']);
    }

    /**
     * Algoritmo de validación para cédulas ecuatorianas
     */
    private function validateCedula(string $cedula): bool
    {
        if (!ctype_digit($cedula)) {
            return false;
        }

        $total = 0;
        $coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $verifier = (int)$cedula[9];

        for ($i = 0; $i < 9; $i++) {
            $value = (int)$cedula[$i] * $coefficients[$i];
            $total += ($value >= 10) ? $value - 9 : $value;
        }

        $calculatedVerifier = ($total % 10 !== 0) ? 10 - ($total % 10) : 0;

        return $calculatedVerifier === $verifier;
    }

    /**
     * Algoritmo completo de validación para RUCs ecuatorianos
     */
    private function validateRuc(string $ruc): bool
    {
        if (!ctype_digit($ruc) || strlen($ruc) !== 13) {
            return false;
        }

        $provinceCode = substr($ruc, 0, 2);
        if ($provinceCode < '01' || $provinceCode > '24') {
            return false;
        }

        $thirdDigit = $ruc[2];
        if (!in_array($thirdDigit, ['0', '1', '2', '3', '4', '5', '6', '9'])) {
            return false;
        }

        // Si es persona natural (tercer dígito 0-5)
        if ($thirdDigit >= '0' && $thirdDigit <= '5') {
            $cedula = substr($ruc, 0, 10);
            if (!$this->validateCedula($cedula)) {
                return false;
            }
            $establishmentCode = substr($ruc, 10, 3);
            return $establishmentCode === '001';
        }
        
        // Si es sociedad privada o extranjera (tercer dígito 9)
        if ($thirdDigit === '9') {
            $establishmentCode = substr($ruc, 10, 3);
            return $establishmentCode === '001';
        }
        
        // Si es institución pública (tercer dígito 6)
        if ($thirdDigit === '6') {
            $establishmentCode = substr($ruc, 10, 3);
            return $establishmentCode === '000';
        }

        return true;
    }

    /**
     * Construye respuesta exitosa
     */
    private function successResponse(Sri $contribuyente, string $cacheKey): JsonResponse
    {
        $establishments = $contribuyente->establishments ?? [];

        return response()->json([
            'success' => true,
            'data' => [
                'identification' => $contribuyente->identification,
                'business_name' => $contribuyente->business_name,
                'legal_name' => $contribuyente->legal_name,
                'commercial_name' => $contribuyente->commercial_name,
                'status' => $contribuyente->status,
                'taxpayer_status' => $contribuyente->taxpayer_status,
                'taxpayer_type' => $contribuyente->taxpayer_type,
                'regime' => $contribuyente->regime,
                'main_activity' => $contribuyente->main_activity,
                'accounting_required' => $contribuyente->accounting_required,
                'withholding_agent' => $contribuyente->withholding_agent,
                'special_taxpayer' => $contribuyente->special_taxpayer,
                'head_office_address' => $contribuyente->head_office_address,
                'debt_amount' => $contribuyente->debt_amount,
                'debt_description' => $contribuyente->debt_description,
                'ruc_number' => $contribuyente->identification,
                'company_name' => $contribuyente->legal_name,
                'taxpayer_dates' => [
                    'start_date' => $contribuyente->start_date,
                    'cessation_date' => $contribuyente->cessation_date,
                    'restart_date' => $contribuyente->restart_date,
                    'update_date' => $contribuyente->update_date,
                ],
                'legal_representatives' => $contribuyente->legal_representatives,
                'cancellation_reason' => $contribuyente->cancellation_reason,
                'ghost_taxpayer' => $contribuyente->ghost_taxpayer,
                'nonexistent_transactions' => $contribuyente->nonexistent_transactions,
                'establishments' => $this->formatEstablishments($establishments)
            ],
            'meta' => [
                'cached' => Cache::has($cacheKey),
                'timestamp' => now()->toISOString(),
                'source' => 'SRI Ecuador',
                'establishments_count' => count($establishments),
                'cache_key' => $cacheKey
            ]
        ], 200);
    }

    /**
     * Formatea los establecimientos
     */
    private function formatEstablishments(array $establishments): array
    {
        return array_map(function ($est) {
            return [
                'number' => $est['numero_establecimiento'] ?? $est['establishment_number'] ?? null,
                'commercial_name' => $est['nombre_comercial'] ?? $est['commercial_name'] ?? null,
                'address' => $est['ubicacion_establecimiento'] ?? $est['complete_address'] ?? null,
                'status' => $est['estado_establecimiento'] ?? $est['establishment_status'] ?? null,
                'department' => $est['department'] ?? null,
                'province' => $est['province'] ?? null,
                'district' => $est['district'] ?? null,
                'parish' => $est['parish'] ?? null,
                'establishment_type' => $est['tipo_establecimiento'] ?? $est['establishment_type'] ?? null,
                'is_headquarters' => $est['es_matriz'] ?? $est['is_headquarters'] ?? false
            ];
        }, $establishments);
    }

    /**
     * Respuesta de error genérica
     */
    private function errorResponse(array $error, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'message' => $error['message'],
                'field' => $error['field'] ?? null,
                'timestamp' => now()->toISOString()
            ]
        ], $status);
    }

    /**
     * Respuesta para errores de validación
     */
    private function validationErrorResponse(ValidationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'message' => 'Error de validación',
                'details' => $e->errors(),
                'timestamp' => now()->toISOString()
            ]
        ], 422);
    }

    /**
     * Respuesta para contribuyente no encontrado
     */
    private function notFoundResponse(string $identification): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'message' => 'Contribuyente no encontrado',
                'details' => 'No se encontró información para el RUC proporcionado',
                'identification' => $identification,
                'suggestion' => 'Verifique el número e intente nuevamente',
                'reference' => 'https://srienlinea.sri.gob.ec',
                'timestamp' => now()->toISOString()
            ]
        ], 404);
    }

    /**
     * Respuesta para errores del servicio SRI
     */
    private function serviceErrorResponse(SriServiceException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'message' => 'Servicio no disponible',
                'details' => $e->getMessage(),
                'retry_after' => 300,
                'service_status' => 'https://estado.sri.gob.ec',
                'timestamp' => now()->toISOString()
            ]
        ], 503);
    }

    /**
     * Respuesta para errores internos del servidor
     */
    private function serverErrorResponse(\Exception $e, Request $request): JsonResponse
    {
        $errorId = uniqid('sri_err_');
        
        Log::error("Error en consulta SRI [$errorId]", [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request' => $request->all()
        ]);

        return response()->json([
            'success' => false,
            'error' => [
                'message' => 'Error interno del servidor',
                'details' => 'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.',
                'error_id' => $errorId,
                'timestamp' => now()->toISOString(),
                'support' => 'soporte@tudominio.com'
            ]
        ], 500);
    }

    /**
     * GET /api/v1/sris/info
     * Proporciona información sobre el uso de la API
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'service' => 'API de Consulta SRI',
                'description' => 'Servicio para consultar información de contribuyentes registrados en el SRI Ecuador',
                'version' => '1.0.0',
                'endpoints' => [
                    [
                        'method' => 'POST',
                        'path' => '/api/v1/sris/search',
                        'description' => 'Consulta información de un contribuyente por POST',
                        'body' => [
                            'identification' => [
                                'type' => 'string',
                                'description' => 'RUC (13 dígitos)',
                                'example' => '0981459876001',
                                'required' => true
                            ]
                        ]
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/api/v1/sris/{identification}',
                        'description' => 'Consulta información de un contribuyente por GET',
                        'parameters' => [
                            'identification' => [
                                'type' => 'string',
                                'description' => 'RUC (13 dígitos)',
                                'example' => '0981459876001',
                                'required' => true
                            ]
                        ]
                    ]
                ],
                'rate_limits' => [
                    'max_requests' => 100,
                    'per_minutes' => 1
                ],
                'contact' => 'soporte@tudominio.com',
                'timestamp' => now()->toISOString()
            ]
        ]);
    }
}