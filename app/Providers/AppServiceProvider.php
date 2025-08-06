<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\App;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use App\Models\SubscriptionPlan;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Verificar si estamos en proceso de migración
        if ($this->app->runningInConsole() && in_array('migrate', $_SERVER['argv'], true)) {
            // Estamos en una migración, no inicializar roles y permisos
            return;
        }

        // Verificar si las tablas existen antes de intentar crear roles y permisos
        if (Schema::hasTable('permissions') && Schema::hasTable('roles')) {
            // Reset cached roles and permissions
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            // Crear roles y permisos por defecto si no existen
            $this->createRolesAndPermissions();
        }

        // Verificar si la tabla de planes de suscripción existe
        if (Schema::hasTable('subscription_plans')) {
            // Crear planes de suscripción predeterminados
            $this->createDefaultSubscriptionPlans();
        }

        // Añadir macro para detectar si estamos en un tenant
        Request::macro('isTenant', function () {
            // Primero intentar usar el helper tenant()
            if (function_exists('tenant') && tenant()) {
                return true;
            }

            // Si no hay tenant, verificar si tenancy está inicializado
            if (app()->bound('tenancy')) {
                $tenancy = app('tenancy');
                if ($tenancy->initialized) {
                    return true;
                }
            }

            // Verificar si el dominio actual no es un dominio central
            $currentDomain = request()->getHost();
            $centralDomains = config('tenancy.central_domains', []);
            
            if (!in_array($currentDomain, $centralDomains)) {
                return true;
            }

            return false;
        });
    }

    /**
     * Crear roles y permisos por defecto
     */
    private function createRolesAndPermissions(): void
    {
        // Crear permisos básicos si no existen
        $permissions = [
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',
            'role.view',
            'role.create',
            'role.edit',
            'role.delete',
            'tenant.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Crear roles si no existen
        $adminRole = Role::findOrCreate('admin');
        $userRole = Role::findOrCreate('user');

        // Asignar permisos al rol admin si no los tiene
        $adminRole->givePermissionTo($permissions);

        // Asignar permisos básicos al rol user si no los tiene
        $userRole->givePermissionTo([
            'user.view'
        ]);
    }

    /**
     * Crear planes de suscripción predeterminados
     */
    private function createDefaultSubscriptionPlans(): void
    {
        // Crear planes predeterminados si no existen
        try {
            SubscriptionPlan::createDefaultPlans();
        } catch (\Exception $e) {
            // Solo registrar el error, pero no detener la aplicación
            Log::error('Error al crear planes de suscripción predeterminados: ' . $e->getMessage());
        }
    }
}
