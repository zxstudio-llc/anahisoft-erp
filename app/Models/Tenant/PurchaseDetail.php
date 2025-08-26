<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id', 'product_id', 'quantity', 'unit_cost', 'discount',
        'subtotal', 'vat_rate', 'vat_value', 'ice_rate', 'ice_value', 'total'
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:4',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'vat_value' => 'decimal:2',
        'ice_rate' => 'decimal:6',
        'ice_value' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class);
    }
}