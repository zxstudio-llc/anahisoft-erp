<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener planes de suscripción
        $freePlan = SubscriptionPlan::where('slug', 'free')->first();
        $professionalPlan = SubscriptionPlan::where('slug', 'professional')->first();
        $enterprisePlan = SubscriptionPlan::where('slug', 'enterprise')->first();

        // Crear tenants de ejemplo
        $tenants = [
            [
                'id' => 'empresa-demo',
                'name' => 'Empresa Demo',
                'email' => 'demo@empresa.com',
                'plan' => $freePlan,
                'is_active' => true,
                'subscription_active' => true,
                'trial_ends_at' => null,
                'billing_period' => 'monthly',
            ],
            [
                'id' => 'tech-solutions',
                'name' => 'Tech Solutions SAC',
                'email' => 'admin@techsolutions.com',
                'plan' => $professionalPlan,
                'is_active' => true,
                'subscription_active' => true,
                'trial_ends_at' => null,
                'billing_period' => 'monthly',
            ],
            [
                'id' => 'consultoria-peru',
                'name' => 'Consultoría Perú EIRL',
                'email' => 'contacto@consultoriaperu.com',
                'plan' => $freePlan,
                'is_active' => true,
                'subscription_active' => false,
                'trial_ends_at' => Carbon::now()->addDays(14),
                'billing_period' => 'monthly',
            ],
            [
                'id' => 'innovacion-digital',
                'name' => 'Innovación Digital SAC',
                'email' => 'info@innovaciondigital.pe',
                'plan' => $enterprisePlan,
                'is_active' => true,
                'subscription_active' => true,
                'trial_ends_at' => null,
                'billing_period' => 'yearly',
            ],
            [
                'id' => 'servicios-contables',
                'name' => 'Servicios Contables Lima',
                'email' => 'contabilidad@servicioscontables.com',
                'plan' => $freePlan,
                'is_active' => false,
                'subscription_active' => false,
                'trial_ends_at' => Carbon::now()->subDays(5),
                'billing_period' => 'monthly',
            ],
        ];

        foreach ($tenants as $tenantData) {
            $tenant = Tenant::firstOrCreate(
                ['id' => $tenantData['id']],
                [
                    'data' => [
                        'name' => $tenantData['name'],
                        'email' => $tenantData['email'],
                        'created_at' => Carbon::now()->toDateTimeString(),
                    ],
                    'subscription_plan_id' => $tenantData['plan']?->id,
                    'is_active' => $tenantData['is_active'],
                    'subscription_active' => $tenantData['subscription_active'],
                    'trial_ends_at' => $tenantData['trial_ends_at'],
                    'subscription_ends_at' => $tenantData['subscription_active'] 
                        ? Carbon::now()->addMonth() 
                        : null,
                    'billing_period' => $tenantData['billing_period'],
                ]
            );

            // Crear dominio para cada tenant si no existe
            $domain = $tenantData['id'] . '.facturacion.test';
            $tenant->domains()->firstOrCreate([
                'domain' => $domain,
            ]);

            $this->command->info("Tenant procesado: {$tenantData['name']} (ID: {$tenantData['id']})");
        }

        $this->command->info('Tenants creados exitosamente!');
    }
}
