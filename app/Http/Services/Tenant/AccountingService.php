<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\ChartOfAccount;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\JournalEntryLine;
use App\Models\Tenant\Invoice;
use App\Models\Tenant\Purchase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccountingService
{
    /**
     * Post a journal entry for a Sale (Invoice with type='sale').
     */
    public function postSale(Invoice $invoice): JournalEntry
    {
        return DB::transaction(function () use ($invoice) {
            $entry = JournalEntry::create([
                'entry_date' => Carbon::parse($invoice->issue_date)->toDateString(),
                'reference' => $this->getDocumentNumber($invoice),
                'module' => 'sales',
                'module_id' => $invoice->id,
                'description' => 'Sale posting',
                'total_debit' => $invoice->total,
                'total_credit' => $invoice->total,
            ]);

            $accounts = $this->getEcuadorianAccounts();

            // Debit: Otras Cuentas por Cobrar No Relacionadas (según XLSX oficial)
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['accounts_receivable']->id,
                'description' => 'Venta a crédito - Cuentas por cobrar',
                'debit' => $invoice->total,
                'credit' => 0,
            ]);

            // Credit: Ventas e Impuestos según corresponda
            if ((float)$invoice->iva > 0) {
                // Credit: Impuesto por pagar (usando cuenta encontrada en XLSX)
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['vat_payable']->id,
                    'description' => 'Impuestos por pagar del ejercicio',
                    'debit' => 0,
                    'credit' => $invoice->iva,
                ]);
                
                // Credit: Ventas Netas (subtotal sin impuestos)
                $subtotalSinIva = $invoice->subtotal_12 + $invoice->subtotal_0;
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['sales_revenue']->id,
                    'description' => 'Ventas netas del período',
                    'debit' => 0,
                    'credit' => $subtotalSinIva,
                ]);
            } else {
                // Credit: Ventas sin impuestos
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['sales_revenue']->id,
                    'description' => 'Ventas netas sin impuestos',
                    'debit' => 0,
                    'credit' => $invoice->total,
                ]);
            }

            return $entry;
        });
    }

    /**
     * Post a journal entry for a Purchase.
     */
    public function postPurchase(Purchase $purchase): JournalEntry
    {
        return DB::transaction(function () use ($purchase) {
            $entry = JournalEntry::create([
                'entry_date' => Carbon::parse($purchase->issue_date)->toDateString(),
                'reference' => $purchase->document_number,
                'module' => 'purchases',
                'module_id' => $purchase->id,
                'description' => 'Purchase posting',
                'total_debit' => $purchase->total,
                'total_credit' => $purchase->total,
            ]);

            $accounts = $this->getEcuadorianAccounts();

            // Debit: Inventarios según el tipo de producto comprado
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['inventory_purchased_goods']->id, // Usamos inventarios comprados a terceros
                'description' => 'Inventarios de productos comprados a terceros',
                'debit' => $purchase->subtotal,
                'credit' => 0,
            ]);

            // Debit: Anticipo de Impuestos si aplica
            if ((float)$purchase->tax > 0) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['vat_receivable']->id,
                    'description' => 'Anticipo de impuesto a la renta',
                    'debit' => $purchase->tax,
                    'credit' => 0,
                ]);
            }

            // Credit: Cuentas por Pagar Diversas/Relacionadas
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['accounts_payable_suppliers']->id,
                'description' => 'Cuentas por pagar a proveedores',
                'debit' => 0,
                'credit' => $purchase->total,
            ]);

            return $entry;
        });
    }

    /**
     * Helper method para generar número de documento
     */
    private function getDocumentNumber(Invoice $invoice): string
    {
        return "{$invoice->establishment_code}-{$invoice->emission_point}-{$invoice->sequential}";
    }

    /**
     * Obtener o crear cuentas según el Plan de Cuentas oficial de Ecuador
     * Usando las cuentas exactas encontradas en el XLSX oficial de la SUPERCIAS
     */
    protected function getEcuadorianAccounts(): array
    {
        // Mapeo según Plan de Cuentas oficial - CUENTAS ENCONTRADAS EN XLSX
        $accountsMap = [
            'accounts_receivable' => [
                'code' => '101.02.05.02.21', 
                'name' => 'OTRAS CUENTAS POR COBRAR NO RELACIONADAS',
                'type' => 'asset',
                'nature' => 'debit'
            ],
            'sales_revenue' => [
                'code' => '401.01', // Agrupamos bajo ingresos operacionales
                'name' => 'VENTAS NETAS',
                'type' => 'income', 
                'nature' => 'credit'
            ],
            'sales_discounts' => [
                'code' => '401.12',
                'name' => '(-) DESCUENTO EN VENTAS',
                'type' => 'income',
                'nature' => 'credit' // Cuenta de naturaleza contraria
            ],
            'sales_returns' => [
                'code' => '401.13',
                'name' => '(-) DEVOLUCIONES EN VENTAS',
                'type' => 'income',
                'nature' => 'credit' // Cuenta de naturaleza contraria
            ],
            'vat_payable' => [
                'code' => '201.07.02', // Según XLSX encontrado
                'name' => 'IMPUESTO A LA RENTA POR PAGAR DEL EJERCICIO',
                'type' => 'liability',
                'nature' => 'credit'
            ],
            'vat_receivable' => [
                'code' => '101.05.03',
                'name' => 'ANTICIPO DE IMPUESTO A LA RENTA',
                'type' => 'asset',
                'nature' => 'debit'
            ],
            'inventory_raw_materials' => [
                'code' => '101.03.01',
                'name' => 'INVENTARIOS DE MATERIA PRIMA',
                'type' => 'asset',
                'nature' => 'debit'
            ],
            'inventory_finished_goods' => [
                'code' => '101.03.05',
                'name' => 'INVENTARIOS DE PROD. TERM. Y MERCAD. EN ALMACÉN - PRODUCIDO POR LA COMPAÑÍA',
                'type' => 'asset',
                'nature' => 'debit'
            ],
            'inventory_purchased_goods' => [
                'code' => '101.03.06',
                'name' => 'INVENTARIOS DE PROD. TERM. Y MERCAD. EN ALMACÉN - COMPRADO A TERCEROS',
                'type' => 'asset',
                'nature' => 'debit'
            ],
            'accounts_payable_related' => [
                'code' => '201.08',
                'name' => 'CUENTAS POR PAGAR DIVERSAS/ RELACIONADAS',
                'type' => 'liability',
                'nature' => 'credit'
            ],
            'accounts_payable_suppliers' => [
                'code' => '202.04',
                'name' => 'CUENTAS POR PAGAR DIVERSAS/RELACIONADAS',
                'type' => 'liability',
                'nature' => 'credit'
            ],
            'cost_of_sales' => [
                'code' => '501',
                'name' => 'COSTO DE VENTAS Y PRODUCCIÓN',
                'type' => 'expense',
                'nature' => 'debit'
            ],
        ];

        $accounts = [];
        foreach ($accountsMap as $key => $accountData) {
            // Buscar primero si existe la cuenta en el plan oficial
            $account = ChartOfAccount::where('code', $accountData['code'])->first();
            
            if (!$account) {
                // Si no existe, crearla siguiendo la estructura oficial
                $account = ChartOfAccount::create([
                    'code' => $accountData['code'],
                    'name' => $accountData['name'],
                    'financial_statement_type' => $accountData['type'],
                    'financial_statement_type_original' => $accountData['name'],
                    'nature' => $accountData['nature'],
                    'level' => $this->calculateAccountLevel($accountData['code']),
                    'active' => true,
                    'has_children' => false, // Estas son cuentas de movimiento
                    'parent_id' => $this->findParentAccount($accountData['code']),
                ]);
            }
            
            $accounts[$key] = $account;
        }
        
        return $accounts;
    }

    /**
     * Calcular el nivel de la cuenta basado en los puntos en el código
     */
    private function calculateAccountLevel(string $code): int
    {
        return substr_count($code, '.') + 1;
    }

    /**
     * Encontrar la cuenta padre basada en el código
     */
    private function findParentAccount(string $code): ?int
    {
        $parts = explode('.', $code);
        
        if (count($parts) <= 1) {
            return null; // Es cuenta de nivel 1, no tiene padre
        }
        
        // Remover el último nivel para obtener el código padre
        array_pop($parts);
        $parentCode = implode('.', $parts);
        
        $parent = ChartOfAccount::where('code', $parentCode)->first();
        return $parent ? $parent->id : null;
    }
}