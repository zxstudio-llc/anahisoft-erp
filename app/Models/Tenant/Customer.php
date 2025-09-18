<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'identification_type', 'identification', 'business_name',
        'trade_name', 'email', 'phone', 'address', 'district', 'province', 'department', 'ubigeo',
        'special_taxpayer', 'accounting_required', 'credit_limit', 'active'
    ];

    protected $casts = [
        'special_taxpayer' => 'boolean',
        'accounting_required' => 'boolean',
        'active' => 'boolean',
        'credit_limit' => 'decimal:2',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoices::class);
    }

    public function getFormattedIdentificationAttribute(): string
    {
        if ($this->identification_type === '07') {
            return 'Final Consumer';
        }
        return $this->identification ?? 'N/A';
    }

    public function getIdentificationTypeNameAttribute(): string
    {
        return match($this->identification_type) {
            '04' => 'RUC',
            '05' => 'Cédula',
            '06' => 'Pasaporte',
            '07' => 'Consumidor Final',
            default => 'Otro'
        };
    }
}