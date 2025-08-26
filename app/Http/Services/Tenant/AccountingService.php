<?php

namespace App\Http\Services\Tenant;

<<<<<<< HEAD
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\JournalEntryDetail;
use App\Models\Tenant\ChartOfAccount;
use App\Models\Tenant\Invoices;
use App\Models\Tenant\Purchase;

class AccountingService
{
    public function createInvoiceJournalEntry(Invoice $invoice): JournalEntry
    {
        $entryNumber = $this->generateEntryNumber();
        
        $entry = JournalEntry::create([
            'company_id' => $invoice->company_id,
            'entry_number' => $entryNumber,
            'entry_date' => $invoice->issue_date,
            'reference_type' => 'invoice',
            'reference_id' => $invoice->id,
            'description' => "Sale to {$invoice->customer->business_name} - Invoice {$invoice->document_number}",
            'total_debit' => $invoice->total,
            'total_credit' => $invoice->total,
            'status' => 'posted'
        ]);

        // Debit: Accounts Receivable
        JournalEntryDetail::create([
            'journal_entry_id' => $entry->id,
            'account_code' => '1.2.01.001', // Accounts Receivable
            'description' => "Sale to {$invoice->customer->business_name}",
            'debit' => $invoice->total,
            'credit' => 0
        ]);

        // Credit: Sales Revenue
        JournalEntryDetail::create([
            'journal_entry_id' => $entry->id,
            'account_code' => '4.1.01.001', // Sales Revenue
            'description' => "Sale to {$invoice->customer->business_name}",
            'debit' => 0,
            'credit' => $invoice->subtotal_0 + $invoice->subtotal_12 + $invoice->subtotal_14
        ]);

        // Credit: VAT Collected (if applicable)
        if ($invoice->vat_value > 0) {
            JournalEntryDetail::create([
                'journal_entry_id' => $entry->id,
                'account_code' => '2.1.04.001', // VAT Collected
                'description' => "VAT on sale to {$invoice->customer->business_name}",
                'debit' => 0,
                'credit' => $invoice->vat_value
            ]);
        }

        $this->updateAccountBalances($entry);
        
        return $entry;
    }

    public function createPurchaseJournalEntry(Purchase $purchase): JournalEntry
    {
        $entryNumber = $this->generateEntryNumber();
        
        $entry = JournalEntry::create([
            'company_id' => $purchase->company_id,
            'entry_number' => $entryNumber,
            'entry_date' => $purchase->receipt_date,
            'reference_type' => 'purchase',
            'reference_id' => $purchase->id,
            'description' => "Purchase from {$purchase->supplier->business_name} - {$purchase->document_number}",
            'total_debit' => $purchase->total,
            'total_credit' => $purchase->total,
            'status' => 'posted'
        ]);

        // Debit: Inventory or Expenses
        JournalEntryDetail::create([
            'journal_entry_id' => $entry->id,
            'account_code' => '1.1.05.001', // Inventory
            'description' => "Purchase from {$purchase->supplier->business_name}",
            'debit' => $purchase->subtotal_0 + $purchase->subtotal_12 + $purchase->subtotal_14,
            'credit' => 0
        ]);

        // Debit: VAT Paid (if applicable)
        if ($purchase->vat_value > 0) {
            JournalEntryDetail::create([
                'journal_entry_id' => $entry->id,
                'account_code' => '1.1.07.001', // VAT Paid
                'description' => "VAT on purchase from {$purchase->supplier->business_name}",
                'debit' => $purchase->vat_value,
                'credit' => 0
            ]);
        }

        // Credit: Accounts Payable
        JournalEntryDetail::create([
            'journal_entry_id' => $entry->id,
            'account_code' => '2.1.01.001', // Accounts Payable
            'description' => "Purchase from {$purchase->supplier->business_name}",
            'debit' => 0,
            'credit' => $purchase->total
        ]);

        $this->updateAccountBalances($entry);
        
        return $entry;
    }

    public function createManualJournalEntry(array $data): JournalEntry
    {
        $entryNumber = $this->generateEntryNumber();
        
        $totalDebit = collect($data['details'])->sum('debit');
        $totalCredit = collect($data['details'])->sum('credit');

        if ($totalDebit != $totalCredit) {
            throw new \Exception('Journal entry must be balanced (total debits must equal total credits)');
        }

        $entry = JournalEntry::create([
            'company_id' => auth()->user()->company_id,
            'entry_number' => $entryNumber,
            'entry_date' => $data['entry_date'],
            'reference_type' => 'manual',
            'description' => $data['description'],
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'status' => 'draft'
        ]);

        foreach ($data['details'] as $detail) {
            JournalEntryDetail::create([
                'journal_entry_id' => $entry->id,
                'account_code' => $detail['account_code'],
                'description' => $detail['description'],
                'debit' => $detail['debit'] ?? 0,
                'credit' => $detail['credit'] ?? 0
            ]);
        }

        return $entry;
    }

    public function postJournalEntry(JournalEntry $entry): void
    {
        $entry->update(['status' => 'posted']);
        $this->updateAccountBalances($entry);
    }

    private function updateAccountBalances(JournalEntry $entry): void
    {
        foreach ($entry->details as $detail) {
            $account = ChartOfAccount::where('code', $detail->account_code)->first();
            
            if ($account) {
                $account->increment('debit_balance', $detail->debit);
                $account->increment('credit_balance', $detail->credit);
            }
        }
    }

    private function generateEntryNumber(): string
    {
        $lastEntry = JournalEntry::where('company_id', auth()->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = $lastEntry ? (int)substr($lastEntry->entry_number, -6) + 1 : 1;
        
        return 'JE-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
=======
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
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    }
}