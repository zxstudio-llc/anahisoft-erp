<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithholdingDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'withholding_id', 'tax_type', 'tax_code', 'taxable_base', 'rate', 'withheld_value'
    ];

    protected $casts = [
        'taxable_base' => 'decimal:2',
        'rate' => 'decimal:2',
        'withheld_value' => 'decimal:2',
    ];

    public function withholding(): BelongsTo
    {
        return $this->belongsTo(Withholding::class);
    }
}