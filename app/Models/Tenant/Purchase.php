<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'supplier_id', 'document_type', 'establishment_code',
        'emission_point', 'sequential', 'authorization', 'issue_date',
        'receipt_date', 'subtotal_0', 'subtotal_12', 'subtotal_14',
        'subtotal_exempt', 'subtotal_no_subject', 'ice_value', 'vat_value',
        'withheld_vat', 'withheld_income_tax', 'total', 'status', 'notes'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'receipt_date' => 'date',
        'subtotal_0' => 'decimal:2',
        'subtotal_12' => 'decimal:2',
        'subtotal_14' => 'decimal:2',
        'subtotal_exempt' => 'decimal:2',
        'subtotal_no_subject' => 'decimal:2',
        'ice_value' => 'decimal:2',
        'vat_value' => 'decimal:2',
        'withheld_vat' => 'decimal:2',
        'withheld_income_tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function withholding(): MorphOne
    {
        return $this->morphOne(Withholding::class, 'withholdable');
    }

    public function getDocumentNumberAttribute(): string
    {
        return "{$this->establishment_code}-{$this->emission_point}-{$this->sequential}";
    }
}