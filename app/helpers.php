<?php

use Stancl\Tenancy\Tenancy;

if (!function_exists('tenant')) {
    /**
     * Get the current tenant.
     *
     * @return \App\Models\Tenant|null
     */
    function tenant()
    {
        try {
            if (app()->bound(Tenancy::class)) {
                $tenancy = app(Tenancy::class);
                if ($tenancy->initialized) {
                    return $tenancy->tenant;
                }
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

if (!function_exists('has_active_subscription')) {
    /**
     * Verifica si el tenant actual tiene una suscripción activa.
     *
     * @return bool
     */
    function has_active_subscription()
    {
        $tenant = tenant();
        
        if (!$tenant) {
            return false;
        }
        
        return $tenant->hasActiveSubscription();
    }
} 