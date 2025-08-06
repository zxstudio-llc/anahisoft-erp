<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'item_type',
        'unit_price',
        'price',
        'cost',
        'stock',
        'unit_type',
        'currency',
        'igv_type',
        'igv_percentage',
        'has_igv',
        'category_id',
        'brand',
        'model',
        'barcode',
        'is_active',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'unit_price' => 'decimal:2',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'igv_percentage' => 'decimal:2',
        'has_igv' => 'boolean',
        'is_active' => 'boolean',
    ];

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

    /**
     * Calcula el precio sin IGV
     */
    public function getPriceWithoutIgvAttribute(): float
    {
        if ($this->has_igv) {
            return round($this->price / (1 + ($this->igv_percentage / 100)), 2);
        }
        return $this->price;
    }

    /**
     * Calcula el IGV
     */
    public function getIgvAmountAttribute(): float
    {
        if ($this->has_igv) {
            return round($this->price - $this->price_without_igv, 2);
        }
        return round($this->price * ($this->igv_percentage / 100), 2);
    }

    /**
     * Calcula el precio con IGV
     */
    public function getPriceWithIgvAttribute(): float
    {
        if ($this->has_igv) {
            return $this->price;
        }
        return round($this->price * (1 + ($this->igv_percentage / 100)), 2);
    }
} 