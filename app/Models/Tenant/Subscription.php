<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'stripe_id',
        'stripe_status',
        'stripe_price',
        'plan_type',
        'quantity',
        'trial_ends_at',
        'ends_at',
        'status',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /**
     * Determina si la suscripción está activa.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    /**
     * Determina si la suscripción está en periodo de prueba.
     *
     * @return bool
     */
    public function onTrial(): bool
    {
        return $this->status === 'active' && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Determina si la suscripción ha expirado.
     *
     * @return bool
     */
    public function hasExpired(): bool
    {
        return $this->status === 'expired' || ($this->ends_at && $this->ends_at->isPast());
    }
} 