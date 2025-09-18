<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Products extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'item_type',
        'unit_type',
        'unit_price',
        'price',
        'cost',
        'vat_rate',
        'ice_rate',
        'irbpnr_rate',
        'has_igv',
        'category_id',
        'brand',
        'model',
        'barcode',
        'sku',
        'stock',
        'min_stock',
        'track_inventory',
        'active',
        'igv_percentage',
    ];

    protected $casts = [
        'unit_price'      => 'decimal:4',
        'price'           => 'decimal:2',
        'cost'            => 'decimal:4',
        'vat_rate'        => 'integer',
        'ice_rate'        => 'decimal:2',
        'irbpnr_rate'     => 'decimal:2',
        'has_igv'         => 'boolean',
        'track_inventory' => 'boolean',
        'active'          => 'boolean',
        'stock'           => 'integer',
        'min_stock'       => 'integer',
        'igv_percentage'  => 'decimal:2',
    ];

    // Relación con detalles de factura
    public function invoiceDetails(): HasMany
    {
        return $this->hasMany(InvoiceDetail::class);
    }

    // Relación con detalles de compra
    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    // Nombre legible del IVA
    public function getVatRateNameAttribute(): string
    {
        return match($this->vat_rate) {
            '0' => '0%',
            '1' => '15%',
            default => 'N/A'
        };
    }

    // Porcentaje de IVA
    public function getVatPercentageAttribute(): float
    {
        return match($this->vat_rate) {
            '0' => 0.00,
            '1' => 0.15,
            default => 0.00
        };
    }

    /**
     * Relación con la categoría
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Devuelve el tipo de unidad formateado
     */
    public function getFormattedUnitTypeAttribute(): string
    {
        return match($this->unit_type) {
            'NIU' => 'Unidad',
            'KGM' => 'Kilogramo',
            'LTR' => 'Litro',
            'MTR' => 'Metro',
            'GLL' => 'Galón',
            'BX' => 'Caja',
            'PK' => 'Paquete',
            default => $this->unit_type,
        };
    }

    public function setVatRateAttribute($value)
    {
        $this->attributes['vat_rate'] = $value;

        // Mapear vat_rate a porcentaje
        $this->attributes['igv_percentage'] = match ($value) {
            '0' => 0.00,    // Exento / 0%
            '1' => 15.00,   // Tarifa general 15%
            default => 0.00,
        };
    }
}
