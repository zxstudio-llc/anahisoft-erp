<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Services\Tenant\ValidateDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DocumentValidationController extends Controller
{
    protected ValidateDocument $validateDocumentService;

    /**
     * Constructor
     */
    public function __construct(ValidateDocument $validateDocumentService)
    {
        $this->validateDocumentService = $validateDocumentService;
    }

    /**
     * Valida un documento de identidad (DNI o RUC)
     */
    public function validate(Request $request)
    {
        $validated = $request->validate([
            'document_type' => 'required|string|size:2',
            'document_number' => 'required|string|max:20',
        ]);

        $documentType = $validated['document_type'];
        $documentNumber = $validated['document_number'];

        try {
            // Según el tipo de documento, llamamos a la API correspondiente
            switch ($documentType) {
                case '01': // DNI
                    return $this->validateDNI($documentNumber);
                case '06': // RUC
                    return $this->validateRUC($documentNumber);
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Tipo de documento no soportado para validación',
                    ]);
            }
        } catch (\Exception $e) {
            Log::error('Error validando documento: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al validar el documento',
            ], 500);
        }
    }

    /**
     * Valida un DNI peruano usando una API externa
     */
    private function validateDNI($dni)
    {
        $result = $this->validateDocumentService->validate_dni($dni);
        
        if ($result['success'] && isset($result['data'])) {
            // Agregamos success: true a la respuesta para mantener consistencia
            $responseData = $result['data'];
            $responseData['success'] = true;
            return response()->json($responseData);
        }
        
        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Error al validar el DNI'
        ]);
    }

    /**
     * Valida un RUC peruano usando una API externa
     */
    private function validateRUC($ruc)
    {
        $result = $this->validateDocumentService->validate_ruc($ruc);
        
        if ($result['success'] && isset($result['data'])) {
            // Agregamos success: true a la respuesta para mantener consistencia
            $responseData = $result['data'];
            $responseData['success'] = true;
            return response()->json($responseData);
        }
        
        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Error al validar el RUC'
        ]);
    }
} 