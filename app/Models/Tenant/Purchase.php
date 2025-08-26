<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_id',
        'issue_date',
        'document_type',
        'series',
        'number',
        'subtotal',
        'tax',
        'total',
        'currency',
        'status',
        'notes',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function getDocumentNumberAttribute(): string
    {
        $num = $this->number ?? '';
        return ($this->series ? $this->series . '-' : '') . (is_numeric($num) ? str_pad((string)$num, 8, '0', STR_PAD_LEFT) : $num);
    }
}