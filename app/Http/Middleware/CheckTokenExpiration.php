<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CheckTokenExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->currentAccessToken()) {
            return $next($request);
        }

        $token = $request->user()->currentAccessToken();
        $tokenCreatedAt = Carbon::parse($token->created_at);
        $expiresAt = $tokenCreatedAt->addMinutes(60);
        $now = Carbon::now();

        // Si faltan menos de 10 minutos para que expire el token
        if ($now->diffInMinutes($expiresAt) <= 10) {
            // Buscar el token de refresco
            $refreshToken = $request->user()->tokens()
                ->where('name', 'LIKE', '%_refresh')
                ->where('abilities', 'LIKE', '%refresh-token%')
                ->first();

            if ($refreshToken) {
                // Renovar tokens automáticamente
                $tokenData = $request->user()->refreshToken($refreshToken->token);
                
                if ($tokenData) {
                    // Agregar los nuevos tokens a la respuesta
                    $response = $next($request);
                    
                    return $response->header('X-New-Access-Token', $tokenData['access_token'])
                        ->header('X-New-Refresh-Token', $tokenData['refresh_token'])
                        ->header('X-New-Access-Token-Expires-At', $tokenData['access_token_expires_at'])
                        ->header('X-New-Refresh-Token-Expires-At', $tokenData['refresh_token_expires_at']);
                }
            }
        }

        return $next($request);
    }
} 