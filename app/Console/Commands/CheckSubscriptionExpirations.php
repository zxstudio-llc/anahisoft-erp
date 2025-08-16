<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Events\StatusTenant;

class CheckSubscriptionExpirations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check-expirations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica y desactiva automáticamente las suscripciones expiradas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando verificación de suscripciones expiradas...');
        
        $now = Carbon::now();
        
        // Buscar tenants con suscripciones activas pero que han expirado
        $expiredTenants = Tenant::where('subscription_active', true)
            ->whereNotNull('subscription_ends_at')
            ->where('subscription_ends_at', '<', $now)
            ->get();
        
        $this->info("Se encontraron {$expiredTenants->count()} inquilinos con suscripciones expiradas.");
        
        foreach ($expiredTenants as $tenant) {
            try {
                $this->info("Desactivando suscripción para el inquilino: {$tenant->id}");
                
                // Desactivar la suscripción
                $tenant->subscription_active = false;
                $tenant->save();
                
                // Emitir evento de cambio de estado
                event(new StatusTenant(
                    $tenant->id,
                    $tenant->is_active,
                    'Su suscripción ha expirado y ha sido desactivada.'
                ));
                
                // Registrar en el log
                Log::info("Suscripción desactivada automáticamente para el inquilino: {$tenant->id}");
                
                // Enviar notificación (en una implementación real)
                // $tenant->notify(new SubscriptionExpired());
                
            } catch (\Exception $e) {
                $this->error("Error al procesar el inquilino {$tenant->id}: {$e->getMessage()}");
                Log::error("Error al desactivar suscripción: {$e->getMessage()}", [
                    'tenant_id' => $tenant->id,
                    'exception' => $e
                ]);
            }
        }
        
        // Buscar tenants con periodos de prueba expirados
        $expiredTrials = Tenant::where('is_active', true)
            ->whereNull('subscription_ends_at')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', $now)
            ->get();
        
        $this->info("Se encontraron {$expiredTrials->count()} inquilinos con periodos de prueba expirados.");
        
        foreach ($expiredTrials as $tenant) {
            try {
                $this->info("Marcando como expirado el periodo de prueba para el inquilino: {$tenant->id}");
                
                // Marcar el periodo de prueba como expirado
                $tenant->subscription_active = false;
                $tenant->save();
                
                // Registrar en el log
                Log::info("Periodo de prueba expirado para el inquilino: {$tenant->id}");
                
                // Enviar notificación (en una implementación real)
                // $tenant->notify(new TrialExpired());
                
            } catch (\Exception $e) {
                $this->error("Error al procesar el inquilino en periodo de prueba {$tenant->id}: {$e->getMessage()}");
                Log::error("Error al marcar periodo de prueba como expirado: {$e->getMessage()}", [
                    'tenant_id' => $tenant->id,
                    'exception' => $e
                ]);
            }
        }
        
        $this->info('Verificación de suscripciones completada.');
        
        return Command::SUCCESS;
    }
} 