<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'nature',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function journalEntryLines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }
}