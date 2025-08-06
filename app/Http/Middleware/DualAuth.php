<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class DualAuth
{
    /**
     * Handle an incoming request.
     * 
     * Este middleware intenta autenticar primero con la sesión web,
     * y si no hay sesión, intenta con token Bearer.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificar si ya está autenticado con cualquier guard
        if (Auth::check()) {
            return $next($request);
        }

        // 2. Intentar autenticación por sesión web primero (solo si es una petición web)
        if ($request->hasSession() && Auth::guard('web')->check()) {
            return $next($request);
        }

        // 3. Si no hay sesión web, intentar con token Bearer
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            // Buscar el token en la base de datos
            $accessToken = PersonalAccessToken::findToken($bearerToken);

            if ($accessToken && $accessToken->can('*')) {
                // Verificar si el token no ha expirado
                if (!$accessToken->expires_at || $accessToken->expires_at->isFuture()) {
                    // Actualizar last_used_at
                    $accessToken->forceFill(['last_used_at' => now()])->save();

                    // Establecer el usuario autenticado usando el guard sanctum
                    Auth::guard('sanctum')->setUser($accessToken->tokenable);

                    return $next($request);
                }
            }

            // Si el token es inválido o expirado, retornar error 401
            return response()->json([
                'message' => 'Token inválido o expirado'
            ], 401);
        }

        // 4. Si ninguna autenticación funciona, retornar error 401
        return response()->json([
            'message' => 'No autenticado'
        ], 401);
    }
}
