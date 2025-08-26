<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Purchase;
use App\Models\Tenant\PurchaseDetail;
use App\Models\Tenant\Products;

class PurchaseService
{
    public function create(array $data): Purchase
    {
        $purchase = Purchase::create([
            'company_id' => auth()->user()->company_id,
            'supplier_id' => $data['supplier_id'],
            'document_type' => $data['document_type'] ?? '01',
            'establishment_code' => $data['establishment_code'],
            'emission_point' => $data['emission_point'],
            'sequential' => $data['sequential'],
            'authorization' => $data['authorization'] ?? null,
            'issue_date' => $data['issue_date'],
            'receipt_date' => $data['receipt_date'] ?? now(),
            'subtotal_0' => 0,
            'subtotal_12' => 0,
            'subtotal_14' => 0,
            'vat_value' => 0,
            'total' => 0,
            'notes' => $data['notes'] ?? null
        ]);

        $this->createDetails($purchase, $data['details']);
        $this->calculateTotals($purchase);

        return $purchase;
    }

    private function createDetails(Purchase $purchase, array $details): void
    {
        foreach ($details as $detail) {
            $product = Products::find($detail['product_id']);
            
            $quantity = $detail['quantity'];
            $unitCost = $detail['unit_cost'];
            $discount = $detail['discount'] ?? 0;
            $subtotal = ($quantity * $unitCost) - $discount;
            
            $vatRate = $detail['vat_rate'] ?? $product->vat_rate;
            $vatValue = $this->calculateVat($subtotal, $vatRate);
            
            $total = $subtotal + $vatValue;

            PurchaseDetail::create([
                'purchase_id' => $purchase->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'discount' => $discount,
                'subtotal' => $subtotal,
                'vat_rate' => $vatRate,
                'vat_value' => $vatValue,
                'total' => $total
            ]);

            // Update product stock and cost
            if ($product->track_inventory) {
                $product->increment('stock', $quantity);
                $product->update(['cost' => $unitCost]);
            }
        }
    }

    private function calculateTotals(Purchase $purchase): void
    {
        $details = $purchase->details;
        
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

        $purchase->update([
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
}
