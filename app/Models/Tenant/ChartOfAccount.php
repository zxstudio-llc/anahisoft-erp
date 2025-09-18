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
        'code',
        'name',
        'financial_statement_type',
        'financial_statement_type_original',
        'nature',
        'parent_id',
        'level',
        'has_children',
        'active',
    ];

    protected $casts = [
        'has_children' => 'boolean',
        'active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }

    public function journalEntryLines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class, 'account_id');
    }

    public function getCurrentBalanceAttribute(): float
    {
        return $this->debit_balance - $this->credit_balance;
    }

    // Accessor para mostrar el tipo de crédito/débito de manera legible
    public function getNatureDisplayAttribute(): string
    {
        switch ($this->nature) {
            case 'debit':
                return 'Débito';
            case 'credit':
                return 'Crédito';
            default:
                return 'debit';
        }
    }

    // Accessor para mostrar el tipo de estado financiero de manera legible
    public function getFinancialStatementTypeDisplayAttribute(): string
    {
        return match ($this->financial_statement_type) {
            'CUENTAS DE ORDEN' => 'Cuentas de Orden',
            'ESTADO DE CAMBIOS EN EL PATRIMONIO' => 'Estado de Cambios en el Patrimonio',
            'ESTADO DE FLUJO DE EFECTIVO' => 'Estado de Flujo de Efectivo',
            'ESTADO DE SITUACION' => 'Estado de Situación',
            'ESTADO DE RESULTADOS' => 'Estado de Resultados',
            default => $this->financial_statement_type ?? 'No especificado'
        };
    }
}