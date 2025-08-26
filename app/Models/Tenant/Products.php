<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Products extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'code', 'name', 'description', 'unit_measure',
        'unit_price', 'cost', 'vat_rate', 'ice_rate', 'irbpnr_rate',
        'stock', 'min_stock', 'track_inventory', 'active'
    ];

    protected $casts = [
        'unit_price' => 'decimal:4',
        'cost' => 'decimal:4',
        'track_inventory' => 'boolean',
        'active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function invoiceDetails(): HasMany
    {
        return $this->hasMany(InvoiceDetail::class);
    }

    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function getVatRateNameAttribute(): string
    {
        return match($this->vat_rate) {
            '0' => '0%',
            '2' => '12%',
            '3' => '14%',
            '6' => 'No Objeto',
            '7' => 'Exento',
            default => 'N/A'
        };
    }

    public function getVatPercentageAttribute(): float
    {
        return match($this->vat_rate) {
            '0' => 0.00,
            '2' => 0.12,
            '3' => 0.14,
            default => 0.00
        };
    }
}