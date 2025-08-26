<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
<<<<<<< HEAD
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
=======
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
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    ];

    protected $casts = [
        'issue_date' => 'date',
<<<<<<< HEAD
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
=======
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
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    }

    public function getDocumentNumberAttribute(): string
    {
<<<<<<< HEAD
        return "{$this->establishment_code}-{$this->emission_point}-{$this->sequential}";
=======
        $num = $this->number ?? '';
        return ($this->series ? $this->series . '-' : '') . (is_numeric($num) ? str_pad((string)$num, 8, '0', STR_PAD_LEFT) : $num);
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    }
}