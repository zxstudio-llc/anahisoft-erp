<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ValidateRequestOrigin
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
        // Para peticiones que no requieren referer (como API desde el mismo dominio)
        if ($request->is('v1/*') || $request->is('api/*')) {
            $origin = $request->header('origin');
            $host = $request->getHost();
            
            // Si no hay origin o el origin coincide con el host, permitir
            if (!$origin || Str::contains($origin, $host)) {
                return $next($request);
            }
        }

        $referer = $request->header('referer');
        $allowedDomains = array_merge(
            config('tenancy.central_domains', []),
            ['fact.test', '.fact.test', 'localhost']
        );

        // Si no hay referer, verificar si es una petición AJAX del mismo dominio
        if (!$referer) {
            $origin = $request->header('origin');
            $host = $request->getHost();
            
            // Si hay origin y coincide con el host actual, permitir
            if ($origin && Str::contains($origin, $host)) {
                return $next($request);
            }
            
            // Si es una petición AJAX sin referer desde el mismo dominio, permitir
            if ($request->ajax() || $request->wantsJson()) {
                return $next($request);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Acceso no autorizado'
            ], 403);
        }

        // Verificar si el referer proviene de un dominio permitido
        $isAllowedDomain = false;
        foreach ($allowedDomains as $domain) {
            if (Str::contains($referer, $domain)) {
                $isAllowedDomain = true;
                break;
            }
        }

        if (!$isAllowedDomain) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso no autorizado'
            ], 403);
        }

        return $next($request);
    }
} 