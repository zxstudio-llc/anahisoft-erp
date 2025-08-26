<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Invoices extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'customer_id', 'document_type', 'establishment_code',
        'emission_point', 'sequential', 'access_key', 'issue_date',
        'payment_method', 'subtotal_0', 'subtotal_12', 'subtotal_14',
        'subtotal_exempt', 'subtotal_no_subject', 'ice_value', 'vat_value',
        'discount', 'total', 'currency', 'additional_info', 'status',
        'xml_content', 'authorization_number', 'authorization_date'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'authorization_date' => 'datetime',
        'subtotal_0' => 'decimal:2',
        'subtotal_12' => 'decimal:2',
        'subtotal_14' => 'decimal:2',
        'subtotal_exempt' => 'decimal:2',
        'subtotal_no_subject' => 'decimal:2',
        'ice_value' => 'decimal:2',
        'vat_value' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(InvoiceDetail::class);
    }

    public function sriDocument(): MorphOne
    {
        return $this->morphOne(SriDocument::class, 'documentable');
    }

    public function withholding(): MorphOne
    {
        return $this->morphOne(Withholding::class, 'withholdable');
    }

    public function getDocumentNumberAttribute(): string
    {
        return "{$this->establishment_code}-{$this->emission_point}-{$this->sequential}";
    }

    public function generateAccessKey(): string
    {
        $date = $this->issue_date->format('dmY');
        $docType = $this->document_type;
        $ruc = $this->company->ruc;
        $environment = $this->company->sri_environment;
        $series = $this->establishment_code . $this->emission_point;
        $sequential = str_pad($this->sequential, 9, '0', STR_PAD_LEFT);
        $numeric = '12345678'; // Should be random
        $emission = '1'; // Normal emission
        
        $key = $date . $docType . $ruc . $environment . $series . $sequential . $numeric . $emission;
        
        // Calculate verification digit
        $verification = $this->calculateVerificationDigit($key);
        
        return $key . $verification;
    }

    private function calculateVerificationDigit(string $key): int
    {
        $multipliers = [2, 3, 4, 5, 6, 7];
        $sum = 0;
        $index = 0;
        
        for ($i = strlen($key) - 1; $i >= 0; $i--) {
            $sum += intval($key[$i]) * $multipliers[$index % 6];
            $index++;
        }
        
        $mod = $sum % 11;
        return $mod < 2 ? $mod : 11 - $mod;
    }
}