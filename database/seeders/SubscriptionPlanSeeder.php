<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Plan Gratuito',
                'slug' => 'free',
                'price' => 0,
                'billing_period' => 'monthly',
                'invoice_limit' => 100,
                'features' => [
                    'Hasta 100 facturas mensuales',
                    'Validación de documentos',
                    'Soporte por correo',
                    'API básica',
                    '1 usuario',
                ],
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Plan Profesional',
                'slug' => 'professional',
                'price' => 199,
                'billing_period' => 'monthly',
                'invoice_limit' => 500,
                'features' => [
                    'Hasta 500 facturas mensuales',
                    'Validación de documentos ilimitada',
                    'Soporte prioritario',
                    'API completa',
                    'Hasta 5 usuarios',
                    'Reportes avanzados',
                ],
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Plan Empresarial',
                'slug' => 'enterprise',
                'price' => 399,
                'billing_period' => 'monthly',
                'invoice_limit' => 0, // ilimitado
                'features' => [
                    'Facturas ilimitadas',
                    'Validación de documentos ilimitada',
                    'Soporte 24/7',
                    'API completa con mayor capacidad',
                    'Usuarios ilimitados',
                    'Reportes personalizados',
                    'Integración con ERP',
                ],
                'is_active' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
} 