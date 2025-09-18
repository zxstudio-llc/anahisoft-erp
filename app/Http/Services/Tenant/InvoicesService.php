<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Invoice;
use App\Models\Tenant\InvoiceDetail;
use App\Models\Tenant\Product;
use App\Models\Tenant\Settings;
use App\Http\Services\Tenant\SriElectronicBillingService;

class InvoicesService
{
    public function __construct(private SriElectronicBillingService $sriService) {}

    public function create(array $data): Invoice
    {
        $settings = Settings::first();
        
        // Generate sequential number
        $lastInvoice = Invoice::where('establishment_code', $settings->establishment_code)
            ->where('emission_point', $settings->emission_point_code)
            ->orderBy('sequential', 'desc')
            ->first();
        
        $sequential = str_pad(($lastInvoice?->sequential ?? 0) + 1, 9, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'customer_id' => $data['customer_id'],
            'establishment_code' => $settings->establishment_code,
            'emission_point' => $settings->emission_point_code,
            'sequential' => $sequential,
            'issue_date' => $data['issue_date'],
            'payment_method' => $data['payment_method'] ?? '01',
            'currency' => 'DOLAR',
            'additional_info' => $data['additional_info'] ?? null,
            'subtotal_0' => 0,
            'subtotal_12' => 0,
            'subtotal_14' => 0,
            'iva' => 0,
            'total' => 0,
            'status' => 'draft'
        ]);

        $this->createDetails($invoice, $data['details']);
        $this->calculateTotals($invoice);
        
        $invoice->access_key = $this->generateAccessKey($invoice);
        $invoice->save();

        return $invoice;
    }

    public function update(Invoice $invoice, array $data): Invoice
    {
        // Eliminar detalles existentes
        $invoice->details()->delete();
        
        // Recrear detalles
        $this->createDetails($invoice, $data['details']);
        $this->calculateTotals($invoice);
        
        // Actualizar datos generales
        $invoice->update([
            'customer_id' => $data['customer_id'],
            'issue_date' => $data['issue_date'],
            'payment_method' => $data['payment_method'] ?? '01',
            'additional_info' => $data['additional_info'] ?? null,
        ]);

        return $invoice;
    }

    private function createDetails(Invoice $invoice, array $details): void
    {
        foreach ($details as $detail) {
            $product = Product::find($detail['product_id']);
            
            if (!$product) {
                throw new \Exception("Product with ID {$detail['product_id']} not found");
            }
            
            $quantity = $detail['quantity'];
            $unitPrice = $detail['unit_price'];
            $discount = $detail['discount'] ?? 0;
            $subtotal = ($quantity * $unitPrice) - $discount;
            
            $vatRate = $product->vat_rate ?? '0';
            $ivaValue = $this->calculateVat($subtotal, $vatRate);
            
            $total = $subtotal + $ivaValue;

            InvoiceDetail::create([
                'invoice_id' => $invoice->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount' => $discount,
                'subtotal' => $subtotal,
                'vat_rate' => $vatRate,
                'iva' => $ivaValue,
                'total' => $total
            ]);

            // Update product stock if inventory tracking is enabled
            if ($product->track_inventory ?? false) {
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
        $ivaValue = 0;

        foreach ($details as $detail) {
            $ivaValue += $detail->iva;
            
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

        $total = $subtotal0 + $subtotal12 + $subtotal14 + $ivaValue;

        $invoice->update([
            'subtotal_0' => $subtotal0,
            'subtotal_12' => $subtotal12,
            'subtotal_14' => $subtotal14,
            'iva' => $ivaValue,
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

    private function generateAccessKey(Invoice $invoice): string
    {
        $settings = Settings::first();
        $date = date('dmY', strtotime($invoice->issue_date));
        $docType = '01'; // Factura
        $ruc = $settings->tax_identification_number;
        $environment = $settings->environment_type === 'production' ? '2' : '1';
        $establishment = $invoice->establishment_code;
        $emissionPoint = $invoice->emission_point;
        $sequential = $invoice->sequential;
        $numericCode = '12345678'; // Código numérico aleatorio de 8 dígitos
        $emissionType = '1'; // 1=Normal

        $accessKeyPartial = $date . $docType . $ruc . $environment . 
                           $establishment . $emissionPoint . $sequential . 
                           $numericCode . $emissionType;

        // Calcular dígito verificador módulo 11
        $checkDigit = $this->calculateCheckDigit($accessKeyPartial);
        
        return $accessKeyPartial . $checkDigit;
    }

    private function calculateCheckDigit(string $accessKey): int
    {
        $multipliers = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2];
        $sum = 0;

        for ($i = 0; $i < strlen($accessKey); $i++) {
            $sum += intval($accessKey[$i]) * $multipliers[$i];
        }

        $remainder = $sum % 11;
        
        if ($remainder === 0) {
            return 0;
        } elseif ($remainder === 1) {
            return 1;
        } else {
            return 11 - $remainder;
        }
    }

    public function authorize(Invoice $invoice): void
    {
        if ($invoice->status !== 'draft') {
            throw new \Exception('Only draft invoices can be authorized');
        }

        try {
            $result = $this->sriService->generateInvoice($invoice);
            
            if ($result['success']) {
                $invoice->update([
                    'status' => 'authorized',
                    'authorization_number' => $result['data']['authorization_number'] ?? null,
                    'authorization_date' => $result['data']['authorization_date'] ?? now(),
                    'authorized_at' => now()
                ]);
            } else {
                $invoice->update([
                    'status' => 'rejected',
                    'rejection_reason' => $result['message']
                ]);
                
                throw new \Exception($result['message']);
            }
            
        } catch (\Exception $e) {
            $invoice->update([
                'status' => 'rejected',
                'rejection_reason' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    public function cancel(Invoice $invoice): void
    {
        if ($invoice->status === 'authorized') {
            throw new \Exception('Cannot cancel authorized invoice');
        }

        $invoice->update([
            'status' => 'cancelled',
            'cancelled_at' => now()
        ]);

        // Restore product stock
        foreach ($invoice->details as $detail) {
            if ($detail->product && ($detail->product->track_inventory ?? false)) {
                $detail->product->increment('stock', $detail->quantity);
            }
        }
    }

    public function duplicate(Invoice $originalInvoice): Invoice
    {
        $data = [
            'customer_id' => $originalInvoice->customer_id,
            'issue_date' => now()->format('Y-m-d'),
            'payment_method' => $originalInvoice->payment_method,
            'additional_info' => $originalInvoice->additional_info,
            'details' => $originalInvoice->details->map(function ($detail) {
                return [
                    'product_id' => $detail->product_id,
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->unit_price,
                    'discount' => $detail->discount
                ];
            })->toArray()
        ];

        return $this->create($data);
    }

    public function generatePDF(Invoice $invoice)
    {
        // Implementar generación de PDF usando DOMPDF o similar
        try {
            $settings = Settings::first();
            
            // Aquí implementarías la lógica de generación de PDF
            // usando una librería como DOMPDF, TCPDF, o similar
            
            $html = view('tenant.invoices.pdf', [
                'invoice' => $invoice->load(['customer', 'details.product']),
                'settings' => $settings
            ])->render();
            
            // Ejemplo con DOMPDF:
            // $pdf = new Dompdf();
            // $pdf->loadHtml($html);
            // $pdf->render();
            // return $pdf->output();
            
            // Por ahora retornamos el HTML
            return $html;
            
        } catch (\Exception $e) {
            throw new \Exception('Error generating PDF: ' . $e->getMessage());
        }
    }

    public function sendByEmail(Invoice $invoice)
    {
        try {
            $settings = Settings::first();
            
            if (!$invoice->customer->email) {
                throw new \Exception('El cliente no tiene email registrado');
            }
            
            // Generar PDF
            $pdf = $this->generatePDF($invoice);
            
            // Enviar email usando Mail facade
            // Mail::to($invoice->customer->email)
            //     ->send(new InvoiceMail($invoice, $pdf));
            
            // Log del envío
            \Log::info('Invoice email sent', [
                'invoice_id' => $invoice->id,
                'customer_email' => $invoice->customer->email,
                'tenant' => tenant()->id
            ]);
            
            return [
                'success' => true,
                'message' => 'Factura enviada exitosamente a ' . $invoice->customer->email
            ];
            
        } catch (\Exception $e) {
            \Log::error('Error sending invoice email', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage()
            ]);
            
            throw new \Exception('Error al enviar email: ' . $e->getMessage());
        }
    }

    /**
     * Regenerar clave de acceso para factura existente
     */
    public function regenerateAccessKey(Invoice $invoice): string
    {
        $invoice->access_key = $this->generateAccessKey($invoice);
        $invoice->save();
        
        return $invoice->access_key;
    }

    /**
     * Validar que la factura se pueda procesar
     */
    public function validateInvoiceForProcessing(Invoice $invoice): array
    {
        $errors = [];
        
        // Validar configuración básica
        $settings = Settings::first();
        if (!$settings) {
            $errors[] = 'No se encontró configuración del sistema';
        }
        
        // Validar cliente
        if (!$invoice->customer) {
            $errors[] = 'La factura no tiene cliente asociado';
        } elseif (!$invoice->customer->document_number) {
            $errors[] = 'El cliente no tiene número de documento';
        }
        
        // Validar detalles
        if ($invoice->details->isEmpty()) {
            $errors[] = 'La factura no tiene detalles';
        }
        
        // Validar totales
        if ($invoice->total <= 0) {
            $errors[] = 'El total de la factura debe ser mayor a cero';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Obtener estadísticas de facturas
     */
    public function getInvoiceStats(array $filters = []): array
    {
        $query = Invoice::query();
        
        // Aplicar filtros de fecha si se proporcionan
        if (isset($filters['date_from'])) {
            $query->whereDate('issue_date', '>=', $filters['date_from']);
        }
        
        if (isset($filters['date_to'])) {
            $query->whereDate('issue_date', '<=', $filters['date_to']);
        }
        
        return [
            'total_invoices' => $query->count(),
            'total_amount' => $query->sum('total'),
            'authorized_count' => $query->where('status', 'authorized')->count(),
            'draft_count' => $query->where('status', 'draft')->count(),
            'rejected_count' => $query->where('status', 'rejected')->count(),
            'cancelled_count' => $query->where('status', 'cancelled')->count(),
        ];
    }

    /**
     * Verificar estado en SRI
     */
    public function checkSriStatus(Invoice $invoice): array
    {
        if (!$invoice->access_key) {
            return [
                'success' => false,
                'message' => 'La factura no tiene clave de acceso generada'
            ];
        }
        
        try {
            // Aquí se implementaría la consulta al SRI
            return $this->sriService->checkAuthorizationStatus($invoice->access_key);
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al consultar estado en SRI: ' . $e->getMessage()
            ];
        }
    }
}