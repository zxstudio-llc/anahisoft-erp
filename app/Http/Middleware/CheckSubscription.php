<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Exceptions\TenantNotFound;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si es el dominio central, permitir todo
        if ($this->isCentralDomain($request)) {
            return $next($request);
        }

        // Obtener el tenant actual
        $tenant = tenant();

        // Si no hay tenant, redirigir a página de error
        if (!$tenant) {
            throw new TenantNotFound();
        }

        // Rutas permitidas incluso sin suscripción activa
        $allowedRoutes = [
            'subscription.expired',
            'subscription.upgrade',
            'subscription.process-payment',
            'sanctum.csrf-cookie'
        ];

        // Si la ruta actual está en las permitidas, permitir el acceso
        if (in_array($request->route()->getName(), $allowedRoutes)) {
            return $next($request);
        }

        // Permitir rutas de API y autenticación
        if ($request->is('api/*') || $request->is('v1/*') || $request->is('sanctum/*')) {
            return $next($request);
        }

        // Obtener la suscripción activa
        $subscription = $tenant->activeSubscription();

        // Verificar si el tenant tiene una suscripción activa
        if (!$subscription || $subscription->status !== 'active') {
            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }

    /**
     * Determina si la solicitud viene del dominio principal o admin
     */
    private function isCentralDomain(Request $request): bool
    {
        $host = $request->getHost();
        $centralDomains = config('tenancy.central_domains', []);
        
        // Verificar si es un dominio central o el dominio admin
        return in_array($host, $centralDomains) || 
               $host === 'admin.' . env('APP_DOMAIN');
    }
} 