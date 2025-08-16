<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class InvoiceUsage extends Model
{
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'invoice_usage';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'total_invoices',
        'monthly_invoices',
        'limit',
        'last_reset',
    ];

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_invoices' => 'integer',
        'monthly_invoices' => 'integer',
        'limit' => 'integer',
        'last_reset' => 'datetime',
    ];

    /**
     * Incrementa el contador de facturas
     *
     * @return bool
     */
    public function incrementInvoiceCount(): bool
    {
        $this->checkAndResetMonthlyCount();
        
        $this->total_invoices++;
        $this->monthly_invoices++;
        
        return $this->save();
    }

    /**
     * Verifica si se ha alcanzado el límite de facturas
     *
     * @return bool
     */
    public function hasReachedLimit(): bool
    {
        $this->checkAndResetMonthlyCount();
        
        // Si el límite es 0, significa que no hay límite
        if ($this->limit === 0) {
            return false;
        }
        
        return $this->monthly_invoices >= $this->limit;
    }

    /**
     * Verifica y reinicia el contador mensual si es necesario
     */
    private function checkAndResetMonthlyCount(): void
    {
        if (!$this->last_reset || $this->last_reset->startOfMonth()->lt(Carbon::now()->startOfMonth())) {
            $this->monthly_invoices = 0;
            $this->last_reset = Carbon::now();
            $this->save();
        }
    }
    
    /**
     * Obtiene el porcentaje de uso del límite mensual
     *
     * @return float
     */
    public function getUsagePercentage(): float
    {
        $this->checkAndResetMonthlyCount();
        
        if ($this->limit === 0) {
            return 0;
        }
        
        return round(($this->monthly_invoices / $this->limit) * 100, 2);
    }
    
    /**
     * Obtiene la cantidad de documentos restantes para el mes actual
     *
     * @return int
     */
    public function getRemainingDocuments(): int
    {
        $this->checkAndResetMonthlyCount();
        
        if ($this->limit === 0) {
            return PHP_INT_MAX; // Sin límite
        }
        
        $remaining = $this->limit - $this->monthly_invoices;
        return $remaining > 0 ? $remaining : 0;
    }
    
    /**
     * Actualiza el límite de documentos según el plan de suscripción
     *
     * @param int $newLimit
     * @return bool
     */
    public function updateLimit(int $newLimit): bool
    {
        $this->limit = $newLimit;
        return $this->save();
    }

    /**
     * Increment the invoice counters.
     */
    public function incrementCounters(): void
    {
        $this->increment('total_invoices');
        $this->increment('monthly_invoices');
    }
} 