<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class CentralLoginController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function validateRuc(Request $request): JsonResponse
    {
        try {
            // Validar que el RUC tenga el formato correcto
            $request->validate([
                'ruc' => ['required', 'string', 'size:13', 'regex:/^[0-9]{13}$/'],
            ]);

            $ruc = $request->input('ruc');
            
            Log::info('Validando RUC:', ['ruc' => $ruc]);

            // ✅ Buscar tenant por RUC en ambos lugares: campo directo Y campo JSON
            $tenant = Tenant::where(function ($query) use ($ruc) {
                $query->where('ruc', $ruc) // Buscar en campo directo
                      ->orWhere('data->ruc', $ruc); // Buscar en campo JSON
            })->first();

            if (!$tenant) {
                Log::warning('RUC no encontrado:', [
                    'ruc' => $ruc,
                    'searched_in' => ['ruc_column', 'data->ruc']
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'RUC no encontrado en la base de datos.',
                    'tenant' => null
                ], 404);
            }

            Log::info('Tenant encontrado:', [
                'tenant_id' => $tenant->id,
                'ruc_from_column' => $tenant->ruc,
                'ruc_from_data' => $tenant->data['ruc'] ?? 'no disponible',
                'company_name' => $tenant->data['company_name'] ?? 'N/A'
            ]);

            // Verificar si el tenant está activo
            if (!$tenant->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'La empresa está desactivada. Contacte al administrador.',
                    'tenant' => null
                ], 403);
            }

            // Verificar suscripción activa
            if (!$tenant->subscription_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'La suscripción ha expirado. Renueve su plan para continuar.',
                    'tenant' => null
                ], 403);
            }

            // ✅ Obtener dominio del tenant usando la relación correcta
            $domain = $tenant->domains()->first();
            
            if (!$domain) {
                Log::error('Sin dominio configurado:', [
                    'ruc' => $ruc, 
                    'tenant_id' => $tenant->id,
                    'domains_count' => $tenant->domains()->count()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'No se ha configurado un dominio para este tenant.',
                    'tenant' => null
                ], 500);
            }

            // Construir URL del tenant
            $loginUrl = "https://{$domain->domain}";

            // ✅ Obtener RUC de la fuente más confiable
            $tenantRuc = $tenant->ruc ?? $tenant->data['ruc'] ?? null;
            
            // ✅ Obtener nombres de la fuente más confiable
            $tradeName = $tenant->trade_name ?? $tenant->data['trade_name'] ?? 'Empresa';
            $companyName = $tenant->data['company_name'] ?? $tradeName;

            Log::info('Tenant válido encontrado:', [
                'tenant_id' => $tenant->id,
                'domain' => $domain->domain,
                'company_name' => $companyName,
                'trade_name' => $tradeName,
                'ruc_final' => $tenantRuc
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RUC válido. Tenant encontrado.',
                'tenant' => [
                    'id' => $tenant->id,
                    'company_name' => $companyName,
                    'trade_name' => $tradeName,
                    'ruc' => $tenantRuc,
                    'domain' => $domain->domain,
                    'login_url' => $loginUrl,
                    'subscription_status' => $tenant->subscription_active ? 'active' : 'inactive',
                    'trial_ends_at' => $tenant->trial_ends_at,
                    'subscription_ends_at' => $tenant->subscription_ends_at,
                    
                    // ✅ Información adicional del campo data (si existe)
                    'business_info' => $tenant->data ? [
                        'business_name' => $tenant->data['business_name'] ?? null,
                        'legal_name' => $tenant->data['legal_name'] ?? null,
                        'commercial_name' => $tenant->data['commercial_name'] ?? null,
                        'status' => $tenant->data['status'] ?? null,
                        'taxpayer_status' => $tenant->data['taxpayer_status'] ?? null,
                        'head_office_address' => $tenant->data['head_office_address'] ?? null,
                    ] : null,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Formato de RUC inválido.',
                'errors' => $e->errors(),
                'tenant' => null
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error validando RUC:', [
                'ruc' => $request->input('ruc'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Intente nuevamente.',
                'tenant' => null
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Opcional: mantener por compatibilidad o redireccionar
        return redirect()->route('validate');
    }
}