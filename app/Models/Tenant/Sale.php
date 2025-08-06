<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'client_id',
        'subtotal',
        'igv',
        'total',
        'status',
        'notes',
        // Campos de facturación electrónica
        'document_type',
        'series',
        'number',
        'sunat_response',
        'sunat_ticket',
        'xml_path',
        'pdf_path',
        'cdr_path',
        'sunat_state',
        'is_electronic',
        'environment'
    ];

    protected $casts = [
        'is_electronic' => 'boolean',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the client that owns the sale.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the products for the sale.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['quantity', 'price', 'subtotal', 'igv', 'total'])
            ->withTimestamps();
    }

    // Métodos para facturación electrónica
    public function getDocumentNumberAttribute(): string
    {
        return $this->series . '-' . str_pad($this->number, 8, '0', STR_PAD_LEFT);
    }

    public function getDocumentTypeNameAttribute(): string
    {
        return match($this->document_type) {
            '01' => 'FACTURA ELECTRÓNICA',
            '03' => 'BOLETA DE VENTA ELECTRÓNICA',
            '07' => 'NOTA DE CRÉDITO ELECTRÓNICA',
            '08' => 'NOTA DE DÉBITO ELECTRÓNICA',
            default => 'DOCUMENTO ELECTRÓNICO'
        };
    }

    public function getEnvironmentNameAttribute(): string
    {
        return match($this->environment) {
            'demo' => 'DEMOSTRACIÓN',
            'test' => 'PRUEBAS',
            'prod' => 'PRODUCCIÓN',
            default => 'DEMOSTRACIÓN'
        };
    }

    public function getSunatStateColorAttribute(): string
    {
        return match($this->sunat_state) {
            'PENDIENTE' => 'yellow',
            'ACEPTADO' => 'green',
            'RECHAZADO' => 'red',
            default => 'gray'
        };
    }
} 