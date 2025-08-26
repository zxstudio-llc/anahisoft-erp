<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'document_type',
        'document_number',
        'email',
        'phone',
        'address',
        'province',
        'canton',
        'parish',
        'country',
        'payment_terms',
        'credit_limit',
        'current_balance',
        'status',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}