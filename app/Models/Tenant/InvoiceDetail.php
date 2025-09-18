<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'main_code',
        'auxiliary_code',
        'description',
        'quantity',
        'unit_price',
        'discount',
        'subtotal',
        'iva',
        'ice',
        'total'
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:6',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'iva' => 'decimal:2',
        'ice' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Relación con la factura (Invoice)
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Relación con el producto (Product)
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class);
    }
}
