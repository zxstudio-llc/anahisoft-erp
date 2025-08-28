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
        'debit_balance', 'credit_balance', 'active', 'credit_debit_type'
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

    // Accessor para mostrar el tipo de crédito/débito de manera legible
    public function getCreditDebitDisplayAttribute(): string
    {
        switch ($this->credit_debit_type) {
            case 'debit':
                return 'Débito';
            case 'credit':
                return 'Crédito';
            case 'neutral':
            default:
                return 'Neutral';
        }
    }

    // Accessor para mostrar el tipo de estado financiero de manera legible
    public function getFinancialStatementTypeDisplayAttribute(): string
    {
        return match ($this->account_subtype) {
            'CUENTAS DE ORDEN' => 'Cuentas de Orden',
            'ESTADO DE CAMBIOS EN EL PATRIMONIO' => 'Estado de Cambios en el Patrimonio',
            'ESTADO DE FLUJO DE EFECTIVO' => 'Estado de Flujo de Efectivo',
            'ESTADO DE SITUACION' => 'Estado de Situación',
            'ESTADO DE RESULTADOS' => 'Estado de Resultados',
            default => $this->account_subtype ?? 'No especificado'
        };
    }
}