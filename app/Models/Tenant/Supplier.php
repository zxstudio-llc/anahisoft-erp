<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'identification_type', 'identification', 'business_name',
        'trade_name', 'email', 'phone', 'address', 'special_taxpayer',
        'accounting_required', 'withhold_income_tax', 'withhold_vat', 'active'
    ];

    protected $casts = [
        'special_taxpayer' => 'boolean',
        'accounting_required' => 'boolean',
        'withhold_income_tax' => 'boolean',
        'withhold_vat' => 'boolean',
        'active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function getIdentificationTypeNameAttribute(): string
    {
        return match($this->identification_type) {
            '04' => 'RUC',
            '05' => 'Cédula',
            '06' => 'Pasaporte',
            default => 'Otro'
        };
    }
}