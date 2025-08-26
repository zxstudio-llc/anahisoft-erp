<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChartOfAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'code', 'name', 'account_type', 'account_subtype',
        'parent_code', 'level', 'is_detail', 'initial_balance',
        'debit_balance', 'credit_balance', 'active'
    ];

    protected $casts = [
        'is_detail' => 'boolean',
        'active' => 'boolean',
        'initial_balance' => 'decimal:2',
        'debit_balance' => 'decimal:2',
        'credit_balance' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_code', 'code');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_code', 'code');
    }

    public function journalEntryDetails(): HasMany
    {
        return $this->hasMany(JournalEntryDetail::class, 'account_code', 'code');
    }

    public function getCurrentBalanceAttribute(): float
    {
        return $this->debit_balance - $this->credit_balance;
    }
}