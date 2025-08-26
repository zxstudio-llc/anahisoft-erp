<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_name', 'trade_name', 'ruc', 'email', 'phone', 'address',
        'establishment_code', 'emission_point', 'sri_environment',
        'digital_signature', 'signature_password', 'special_taxpayer',
        'accounting_required', 'sri_certificates'
    ];

    protected $casts = [
        'special_taxpayer' => 'boolean',
        'accounting_required' => 'boolean',
        'sri_certificates' => 'array',
    ];

    protected $hidden = ['signature_password'];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Products::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoices::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function chartOfAccounts(): HasMany
    {
        return $this->hasMany(ChartOfAccount::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }
}