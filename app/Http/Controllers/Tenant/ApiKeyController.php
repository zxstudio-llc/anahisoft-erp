<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Sanctum\PersonalAccessToken;

class ApiKeyController extends Controller
{
    /**
     * Muestra la lista de API Keys del usuario
     */
    public function index()
    {
        $tokens = Auth::user()->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Nunca',
                'created_at' => $token->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Tenant/ApiKeys/Index', [
            'tokens' => $tokens,
        ]);
    }

    /**
     * Almacena una nueva API Key
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => 'required|array',
        ]);

        try {
            DB::beginTransaction();
            
            $token = $request->user()->createToken(
                $validated['name'],
                $validated['abilities']
            );
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'token' => $token->plainTextToken,
                'message' => 'API Key creada correctamente. Guarde esta clave en un lugar seguro, no se mostrará nuevamente.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la API Key: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una API Key
     */
    public function destroy($id)
    {
        try {
            $token = PersonalAccessToken::findOrFail($id);
            
            // Verificar que el token pertenece al usuario actual
            if ($token->tokenable_id !== Auth::id() || $token->tokenable_type !== get_class(Auth::user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar esta API Key'
                ], 403);
            }
            
            $token->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'API Key eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la API Key: ' . $e->getMessage()
            ], 500);
        }
    }
} 