<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
<<<<<<< HEAD
use Illuminate\Database\Eloquent\Relations\BelongsTo;
=======
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
<<<<<<< HEAD
        'company_id', 'entry_number', 'entry_date', 'reference_type',
        'reference_id', 'description', 'total_debit', 'total_credit', 'status'
=======
        'entry_date',
        'reference',
        'module',
        'module_id',
        'description',
        'total_debit',
        'total_credit',
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    ];

    protected $casts = [
        'entry_date' => 'date',
        'total_debit' => 'decimal:2',
        'total_credit' => 'decimal:2',
    ];

<<<<<<< HEAD
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
=======
    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    }
}