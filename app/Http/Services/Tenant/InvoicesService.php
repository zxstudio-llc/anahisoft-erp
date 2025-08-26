<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Invoices;
use App\Models\Tenant\InvoiceDetail;
use App\Models\Tenant\Products;
use App\Models\Tenant\Company;
use App\Services\Tenant\SrisService;

class InvoicesService
{
    public function __construct(private SriService $sriService) {}

    public function create(array $data): Invoice
    {
        $company = Company::find(auth()->user()->company_id);
        
        // Generate sequential number
        $lastInvoice = Invoices::where('company_id', $company->id)
            ->where('establishment_code', $company->establishment_code)
            ->where('emission_point', $company->emission_point)
            ->orderBy('sequential', 'desc')
            ->first();
        
        $sequential = str_pad(($lastInvoice?->sequential ?? 0) + 1, 9, '0', STR_PAD_LEFT);

        $invoice = Invoices::create([
            'company_id' => $company->id,
            'customer_id' => $data['customer_id'],
            'establishment_code' => $company->establishment_code,
            'emission_point' => $company->emission_point,
            'sequential' => $sequential,
            'issue_date' => $data['issue_date'],
            'payment_method' => $data['payment_method'] ?? '01',
            'currency' => 'DOLAR',
            'additional_info' => $data['additional_info'] ?? null,
            'subtotal_0' => 0,
            'subtotal_12' => 0,
            'subtotal_14' => 0,
            'vat_value' => 0,
            'total' => 0
        ]);

        $this->createDetails($invoice, $data['details']);
        $this->calculateTotals($invoice);
        
        $invoice->access_key = $invoice->generateAccessKey();
        $invoice->save();

        return $invoice;
    }

    private function createDetails(Invoice $invoice, array $details): void
    {
        foreach ($details as $detail) {
            $product = Products::find($detail['product_id']);
            
            $quantity = $detail['quantity'];
            $unitPrice = $detail['unit_price'];
            $discount = $detail['discount'] ?? 0;
            $subtotal = ($quantity * $unitPrice) - $discount;
            
            $vatRate = $product->vat_rate;
            $vatValue = $this->calculateVat($subtotal, $vatRate);
            
            $total = $subtotal + $vatValue;

            InvoiceDetail::create([
                'invoice_id' => $invoice->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount' => $discount,
                'subtotal' => $subtotal,
                'vat_rate' => $vatRate,
                'vat_value' => $vatValue,
                'total' => $total
            ]);

            // Update product stock if inventory tracking is enabled
            if ($product->track_inventory) {
                $product->decrement('stock', $quantity);
            }
        }
    }

    private function calculateTotals(Invoice $invoice): void
    {
        $details = $invoice->details()->with('product')->get();
        
        $subtotal0 = 0;
        $subtotal12 = 0;
        $subtotal14 = 0;
        $vatValue = 0;

        foreach ($details as $detail) {
            $vatValue += $detail->vat_value;
            
            switch ($detail->vat_rate) {
                case '0':
                    $subtotal0 += $detail->subtotal;
                    break;
                case '2':
                    $subtotal12 += $detail->subtotal;
                    break;
                case '3':
                    $subtotal14 += $detail->subtotal;
                    break;
            }
        }

        $total = $subtotal0 + $subtotal12 + $subtotal14 + $vatValue;

        $invoice->update([
            'subtotal_0' => $subtotal0,
            'subtotal_12' => $subtotal12,
            'subtotal_14' => $subtotal14,
            'vat_value' => $vatValue,
            'total' => $total
        ]);
    }

    private function calculateVat(float $subtotal, string $vatRate): float
    {
        return match($vatRate) {
            '0' => 0,
            '2' => $subtotal * 0.12,
            '3' => $subtotal * 0.14,
            default => 0
        };
    }

    public function authorize(Invoice $invoice): void
    {
        $this->sriService->authorizeInvoice($invoice);
    }
}
