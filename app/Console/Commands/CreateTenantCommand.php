<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

class CreateTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:create 
                            {id : El ID único del tenant}
                            {name : El nombre del tenant}
                            {email : El email del tenant}
                            {--plan=free : El plan de suscripción (free, professional, enterprise)}
                            {--trial-days=14 : Días de prueba gratuita}
                            {--active=true : Si el tenant está activo}
                            {--seed : Ejecutar seeders con datos de ejemplo}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crear un nuevo tenant con configuración inicial';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument('id');
        $name = $this->argument('name');
        $email = $this->argument('email');
        
        $planName = $this->option('plan');
        $trialDays = (int) $this->option('trial-days');
        $isActive = filter_var($this->option('active'), FILTER_VALIDATE_BOOLEAN);
        $shouldSeed = $this->option('seed');

        // Validar que el tenant no exista
        if (Tenant::find($id)) {
            $this->error("El tenant con ID '{$id}' ya existe.");
            return 1;
        }

        // Validar formato del ID
        if (!preg_match('/^[a-z0-9-]+$/', $id)) {
            $this->error('El ID del tenant solo puede contener letras minúsculas, números y guiones.');
            return 1;
        }

        // Validar email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('El email proporcionado no es válido.');
            return 1;
        }

        // Obtener plan de suscripción
        $plan = SubscriptionPlan::where('slug', $planName)->first();
        if (!$plan) {
            $this->error("El plan '{$planName}' no existe. Planes disponibles: free, professional, enterprise");
            return 1;
        }

        $this->info("Creando tenant: {$name}");
        $this->info("ID: {$id}");
        $this->info("Email: {$email}");
        $this->info("Plan: {$plan->name}");
        $this->info("Días de prueba: {$trialDays}");
        
        if (!$this->confirm('¿Deseas continuar?')) {
            $this->info('Operación cancelada.');
            return 0;
        }

        try {
            // Crear el tenant
            $tenant = Tenant::create([
                'id' => $id,
                'data' => [
                    'name' => $name,
                    'email' => $email,
                    'created_at' => Carbon::now()->toDateTimeString(),
                ],
                'subscription_plan_id' => $plan->id,
                'is_active' => $isActive,
                'subscription_active' => false, // Inicialmente sin suscripción activa
                'trial_ends_at' => $trialDays > 0 ? Carbon::now()->addDays($trialDays) : null,
                'subscription_ends_at' => null,
                'billing_period' => 'monthly',
            ]);

            // Crear dominio para el tenant
            $domain = $id . '.facturacion.test';
            $tenant->domains()->create([
                'domain' => $domain,
            ]);

            $this->info("✓ Tenant creado exitosamente!");
            $this->info("✓ Dominio creado: {$domain}");

            // Ejecutar migraciones del tenant
            $this->info('Ejecutando migraciones del tenant...');
            $tenant->run(function () {
                Artisan::call('migrate', ['--force' => true]);
            });
            $this->info('✓ Migraciones ejecutadas');

            // Ejecutar seeders si se solicitó
            if ($shouldSeed) {
                $this->info('Ejecutando seeders con datos de ejemplo...');
                $tenant->run(function () {
                    Artisan::call('db:seed', [
                        '--class' => 'TenantDatabaseSeeder',
                        '--force' => true
                    ]);
                });
                $this->info('✓ Datos de ejemplo creados');
                $this->info('  - Usuario admin: admin@' . $tenant->id . '.com');
                $this->info('  - Usuario manager: manager@' . $tenant->id . '.com');
                $this->info('  - Contraseña: password');
            }

            $this->info('\n🎉 Tenant creado completamente!');
            $this->info("Accede en: https://{$domain}");
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('Error al crear el tenant: ' . $e->getMessage());
            
            // Limpiar en caso de error
            if (isset($tenant)) {
                $tenant->delete();
                $this->info('Tenant eliminado debido al error.');
            }
            
            return 1;
        }
    }
}
