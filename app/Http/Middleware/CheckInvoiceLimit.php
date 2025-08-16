<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant\InvoiceUsage;
use Illuminate\Support\Facades\Log;

class CheckInvoiceLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();
        $subscription = $tenant->activeSubscription();

        if (!$subscription || $subscription->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'No tiene una suscripción activa'
            ], 403);
        }

        // Obtener el plan desde la base de datos central
        $plan = tenancy()->central(function () use ($tenant) {
            return $tenant->subscriptionPlan;
        });

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el límite de facturas. Por favor, contacte al administrador.'
            ], 403);
        }

        // Si el plan no tiene límite (0 = ilimitado), permitir la acción
        if ($plan->invoice_limit === 0) {
            return $next($request);
        }

        // Verificar el uso de facturas
        $invoiceUsage = InvoiceUsage::first();
        if (!$invoiceUsage) {
            $invoiceUsage = InvoiceUsage::create([
                'total_invoices' => 0,
                'monthly_invoices' => 0,
                'limit' => $plan->invoice_limit,
                'last_reset' => now(),
            ]);
        }

        // Verificar si se ha alcanzado el límite
        if ($invoiceUsage->monthly_invoices >= $plan->invoice_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Ha alcanzado el límite de facturas de su plan actual'
            ], 403);
        }

        return $next($request);
    }
    
    /**
     * Verifica si la ruta está relacionada con facturación o API
     */
    private function isInvoiceRelatedRoute(Request $request): bool
    {
        // Rutas relacionadas con facturación
        $invoiceRoutes = [
            'tenant.invoices.*',
            'tenant.api.invoices.*',
        ];
        
        // Verificar si es una ruta de API
        if ($request->is('api/v1/invoices*') || $request->is('api/v1/documents*')) {
            return true;
        }
        
        // Verificar rutas nombradas
        foreach ($invoiceRoutes as $route) {
            if ($request->routeIs($route)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtiene el límite de facturas según el plan de suscripción
     */
    private function getInvoiceLimit(): int
    {
        $tenant = tenant();
        
        if (!$tenant || !$tenant->subscriptionPlan) {
            return 0; // Sin límite por defecto
        }
        
        return $tenant->subscriptionPlan->invoice_limit;
    }
} 