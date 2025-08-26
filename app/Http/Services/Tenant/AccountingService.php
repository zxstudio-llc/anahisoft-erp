<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Account;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\JournalEntryLine;
use App\Models\Tenant\Sale;
use App\Models\Tenant\Purchase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccountingService
{
    /**
     * Post a journal entry for a Sale.
     */
    public function postSale(Sale $sale): JournalEntry
    {
        return DB::transaction(function () use ($sale) {
            $entry = JournalEntry::create([
                'entry_date' => Carbon::parse($sale->created_at)->toDateString(),
                'reference' => $sale->document_number,
                'module' => 'sales',
                'module_id' => $sale->id,
                'description' => 'Sale posting',
                'total_debit' => $sale->total,
                'total_credit' => $sale->total,
            ]);

            $accounts = $this->getDefaultAccounts();

            // Debit Accounts Receivable / Cash
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['accounts_receivable'],
                'description' => 'Accounts Receivable',
                'debit' => $sale->total,
                'credit' => 0,
            ]);

            // Credit Sales Revenue (subtotal) and VAT Payable (igv)
            if ((float)$sale->igv > 0) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['vat_payable'],
                    'description' => 'IVA por pagar',
                    'debit' => 0,
                    'credit' => $sale->igv,
                ]);
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['sales_revenue'],
                    'description' => 'Ventas',
                    'debit' => 0,
                    'credit' => $sale->subtotal,
                ]);
            } else {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['sales_revenue'],
                    'description' => 'Ventas',
                    'debit' => 0,
                    'credit' => $sale->total,
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

            $accounts = $this->getDefaultAccounts();

            // Debit Inventory (or Expense)
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['inventory'],
                'description' => 'Inventario',
                'debit' => $purchase->subtotal,
                'credit' => 0,
            ]);

            // Debit VAT Recoverable if any
            if ((float)$purchase->tax > 0) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts['vat_recoverable'],
                    'description' => 'IVA crédito',
                    'debit' => $purchase->tax,
                    'credit' => 0,
                ]);
            }

            // Credit Accounts Payable
            JournalEntryLine::create([
                'journal_entry_id' => $entry->id,
                'account_id' => $accounts['accounts_payable'],
                'description' => 'Cuentas por pagar',
                'debit' => 0,
                'credit' => $purchase->total,
            ]);

            return $entry;
        });
    }

    /**
     * Ensure default accounts exist and return their IDs.
     */
    protected function getDefaultAccounts(): array
    {
        $map = [
            'accounts_receivable' => ['1120', 'Cuentas por cobrar', 'asset', 'debit'],
            'sales_revenue' => ['4110', 'Ingresos por ventas', 'income', 'credit'],
            'vat_payable' => ['2120', 'IVA por pagar', 'liability', 'credit'],
            'inventory' => ['1140', 'Inventarios', 'asset', 'debit'],
            'vat_recoverable' => ['1130', 'IVA crédito fiscal', 'asset', 'debit'],
            'accounts_payable' => ['2110', 'Cuentas por pagar', 'liability', 'credit'],
        ];

        $ids = [];
        foreach ($map as $key => [$code, $name, $type, $nature]) {
            $account = Account::firstOrCreate(['code' => $code], [
                'name' => $name,
                'type' => $type,
                'nature' => $nature,
                'is_active' => true,
            ]);
            $ids[$key] = $account->id;
        }
        return $ids;
    }
}