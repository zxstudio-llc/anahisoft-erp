<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Withholding extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'document_type', 'establishment_code', 'emission_point',
        'sequential', 'access_key', 'issue_date', 'period', 'withheld_vat',
        'withheld_income_tax', 'status', 'xml_content', 'authorization_number',
        'authorization_date'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'authorization_date' => 'datetime',
        'withheld_vat' => 'decimal:2',
        'withheld_income_tax' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function withholdable(): MorphTo
    {
        return $this->morphTo();
    }

    public function details(): HasMany
    {
        return $this->hasMany(WithholdingDetail::class);
    }

    public function sriDocument(): MorphOne
    {
        return $this->morphOne(SriDocument::class, 'documentable');
    }
}