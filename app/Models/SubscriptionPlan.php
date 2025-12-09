<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    /**
     * Constantes para los planes predeterminados
     */
    const PLAN_FREE = 'free';
    const PLAN_PROFESSIONAL = 'professional';
    const PLAN_ENTERPRISE = 'enterprise';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'stripe_plan_id',
        'price',
        'billing_period',
        'invoice_limit',
        'features',
        'is_active',
        'is_featured',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'invoice_limit' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Relación con tenants
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }
    
    /**
     * Relación con pagos
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
    
    /**
     * Crea los planes predeterminados si no existen
     */
    public static function createDefaultPlans()
    {
        // Plan Básico
        if (!self::where('slug', self::PLAN_FREE)->exists()) {
            self::create([
                'name' => 'Plan Gratuito',
                'slug' => self::PLAN_FREE,
                'price' => 0.00,
                'billing_period' => 'monthly',
                'invoice_limit' => 200, // 200 documentos por mes
                'features' => [
                    'Facturación electrónica',
                    'Hasta 200 documentos mensuales',
                    'Soporte por email',
                    '1 usuario'
                ],
                'is_active' => true,
                'is_featured' => false,
            ]);
        }
        
        // Plan Estándar
        if (!self::where('slug', self::PLAN_PROFESSIONAL)->exists()) {
            self::create([
                'name' => 'Plan Profesional',
                'slug' => self::PLAN_PROFESSIONAL,
                'price' => 59.99,
                'billing_period' => 'monthly',
                'invoice_limit' => 500, // 500 documentos por mes
                'features' => [
                    'Facturación electrónica',
                    'Hasta 500 documentos mensuales',
                    'Soporte prioritario',
                    '3 usuarios',
                    'Reportes avanzados'
                ],
                'is_active' => true,
                'is_featured' => true,
            ]);
        }
        
        // Plan Enterprise
        if (!self::where('slug', self::PLAN_ENTERPRISE)->exists()) {
            self::create([
                'name' => 'Plan Empresarial',
                'slug' => self::PLAN_ENTERPRISE,
                'price' => 99.99,
                'billing_period' => 'monthly',
                'invoice_limit' => 0, // Sin límite (personalizable)
                'features' => [
                    'Facturación electrónica',
                    'Documentos ilimitados',
                    'Soporte 24/7',
                    'Usuarios ilimitados',
                    'API personalizada',
                    'Integración con ERP'
                ],
                'is_active' => true,
                'is_featured' => false,
            ]);
        }
    }

    /**
     * Get the subscriptions for the plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'S/ ' . number_format($this->price, 2);
    }

    /**
     * Get the invoice limit text.
     */
    public function getInvoiceLimitTextAttribute(): string
    {
        return $this->invoice_limit === 0 ? 'Ilimitadas' : number_format($this->invoice_limit);
    }
} 