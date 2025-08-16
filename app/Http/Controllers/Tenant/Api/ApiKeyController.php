<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class ApiKeyController extends Controller
{
    /**
     * Listar tokens
     */
    public function index(Request $request)
    {
        $query = PersonalAccessToken::query();
        
        // Obtener parámetros desde params[] o directamente
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);
        
        // Filtros
        if (!empty($search)) {
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);
        
        // Paginación
        $tokens = $query->paginate($perPage)->withQueryString();
        
        return response()->json([
            'success' => true,
            'tokens' => $tokens,
            'filters' => [
                'search' => $search ?? '',
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
        ]);
    }

    /**
     * Crear un nuevo token
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'abilities' => 'nullable|array',
            'abilities.*' => 'string',
            'expiration' => 'nullable|date|after:now',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $name = $request->input('name');
            $abilities = $request->input('abilities', ['*']);
            $expiration = $request->input('expiration');

            // Convertir la fecha de expiración si está presente
            $expiresAt = null;
            if ($expiration) {
                $expiresAt = Carbon::parse($expiration)->endOfDay();
            }

            // Crear el token con los parámetros correctos
            if ($expiresAt) {
                $token = $user->createToken($name, $abilities, $expiresAt);
            } else {
                $token = $user->createToken($name, $abilities);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Token creado correctamente',
                'data' => [
                    'token' => $token->plainTextToken,
                    'token_type' => 'Bearer',
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating API token', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? 'unknown',
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la llave API: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un token
     */
    public function destroy($id)
    {
        $token = PersonalAccessToken::find($id);
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token no encontrado'
            ], 404);
        }
        
        $token->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Token eliminado correctamente'
        ]);
    }
} 