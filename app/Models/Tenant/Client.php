<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'document_type',
        'document_number',
        'email',
        'phone',
        'address',
        'district',
        'province',
        'department',
        'country',
        'ubigeo',
        'is_active',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Devuelve el tipo de documento formateado para mostrar
     *
     * @return string
     */
    public function getFormattedDocumentTypeAttribute(): string
    {
        return match($this->document_type) {
            '01' => 'DNI',
            '06' => 'RUC',
            '04' => 'CE',
            '07' => 'Pasaporte',
            '00' => 'No Domiciliado',
            default => 'Otro',
        };
    }

    /**
     * Devuelve la dirección completa
     *
     * @return string
     */
    public function getFullAddressAttribute(): string
    {
        $parts = [];
        
        if ($this->address) {
            $parts[] = $this->address;
        }
        
        $location = [];
        if ($this->district) {
            $location[] = $this->district;
        }
        if ($this->province) {
            $location[] = $this->province;
        }
        if ($this->department) {
            $location[] = $this->department;
        }
        
        if (!empty($location)) {
            $parts[] = implode(', ', $location);
        }
        
        return implode(' - ', $parts);
    }
} 