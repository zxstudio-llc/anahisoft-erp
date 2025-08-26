<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'entry_number', 'entry_date', 'reference_type',
        'reference_id', 'description', 'total_debit', 'total_credit', 'status'
    ];

    protected $casts = [
        'entry_date' => 'date',
        'total_debit' => 'decimal:2',
        'total_credit' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(JournalEntryDetail::class);
    }

    public function isBalancedAttribute(): bool
    {
        return $this->total_debit == $this->total_credit;
    }
}