<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Middleware\EnforceTenancy as BaseEnforceTenancy;
use Symfony\Component\HttpFoundation\Response;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedException;

class EnforceTenancy extends BaseEnforceTenancy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Verificar si estamos en un dominio de tenant
            if (!tenant()) {
                return response()->json([
                    'message' => 'No se pudo identificar el inquilino',
                    'domain' => $request->getHost()
                ], 404);
            }

            // Verificar si el tenant está activo
            if (!tenant()->is_active) {
                return response()->json([
                    'message' => 'El inquilino está inactivo',
                    'domain' => $request->getHost()
                ], 403);
            }

            // Forzar el uso del tenant actual
            tenancy()->initialize(tenant());

            return $next($request);
        } catch (TenantCouldNotBeIdentifiedException $e) {
            return response()->json([
                'message' => 'No se pudo identificar el inquilino',
                'domain' => $request->getHost()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al procesar la solicitud',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
