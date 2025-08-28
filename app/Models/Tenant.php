<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;
    
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'ruc',
        'trade_name',
        'email',
        'subscription_plan_id',
        'trial_ends_at',
        'is_active',
        'subscription_active',
        'subscription_ends_at',
        'billing_period',
        'data',
    ];
    
    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'is_active' => 'boolean',
        'subscription_active' => 'boolean',
        'data' => 'array',
    ];
    
    /**
     * Get the subscriptions for the tenant.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
    
    /**
     * Relación con el plan de suscripción
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }
    
    /**
     * Get the current active subscription.
     */
    public function activeSubscription()
    {
        return $this->subscriptions()
            ->with('plan')
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->latest()
            ->first();
    }
    
    /**
     * Verifica si el tenant tiene una suscripción activa
     */
    public function hasActiveSubscription(): bool
    {
        $subscription = $this->activeSubscription();
        return $subscription && $subscription->status === 'active';
    }
    
    /**
     * Verifica si el tenant está en periodo de prueba
     */
    public function onTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }
    
    /**
     * Check if the tenant can use the system.
     */
    public function canUseSystem(): bool
    {
        return $this->is_active && ($this->hasActiveSubscription() || $this->onTrial());
    }
}
