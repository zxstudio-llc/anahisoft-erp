<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoicesss extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'date',
        'due_date',
        'number',
        'series',
        'currency',
        'exchange_rate',
        'subtotal',
        'tax',
        'total',
        'status',
        'notes'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'date' => 'datetime',
        'due_date' => 'datetime',
        'exchange_rate' => 'float',
        'subtotal' => 'float',
        'tax' => 'float',
        'total' => 'float'
    ];

    /**
     * Obtiene el cliente asociado a la factura.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
} 