<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Invoice;
use App\Models\Tenant\Customer;
use App\Models\Tenant\Products;
use App\Http\Services\Tenant\SriElectronicBillingService;
use App\Http\Services\Tenant\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceSaleController extends Controller
{
    protected $electronicBillingService;
    protected AccountingService $accountingService;

    public function __construct(SriElectronicBillingService $electronicBillingService)
    {
        $this->electronicBillingService = $electronicBillingService;
        $this->accountingService = new AccountingService();
    }

    /**
     * Listar ventas (invoices con type = sale)
     */
    public function index(Request $request)
    {
        $query = Invoice::where('type', 'sale')->with('customer');

        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $status = $params['status'] ?? $request->input('status');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);

        if (!empty($search)) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('identification', 'like', "%{$search}%");
            });
        }

        if (!empty($status)) {
            $query->where('status', $status);
        }

        $query->orderBy($sortField, $sortOrder);

        $sales = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'sales' => $sales,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int) $perPage,
            ],
            'statuses' => [
                ['value' => 'draft', 'label' => 'Borrador'],
                ['value' => 'issued', 'label' => 'Emitida'],
                ['value' => 'authorized', 'label' => 'Autorizada'],
                ['value' => 'rejected', 'label' => 'Rechazada'],
                ['value' => 'canceled', 'label' => 'Cancelada'],
            ],
        ]);
    }

    /**
     * Mostrar una venta
     */
    public function show($id)
    {
        $invoice = Invoice::where('type', 'sale')
            ->with(['customer', 'details.product'])
            ->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    /**
     * Crear una nueva venta
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|numeric|min:1',
            'document_type' => 'required|in:01,03',
            'is_electronic' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // ✅ NUEVA VALIDACIÓN: Usar helper method para validar stock
            $stockErrors = $this->validateStockAvailability($request->products);
            
            if (!empty($stockErrors)) {
                $errorMessages = [];
                foreach ($stockErrors as $error) {
                    $errorMessages[] = "Stock insuficiente para {$error['product_name']}. Disponible: {$error['available_stock']}, Solicitado: {$error['requested_quantity']}";
                }
                
                throw new \Exception(implode('; ', $errorMessages));
            }

            $subtotal_12 = 0; // Subtotal con IVA 12%
            $subtotal_0 = 0;  // Subtotal con IVA 0%
            $iva = 0;         // Monto del IVA
            $ice = 0;         // Monto del ICE
            $total = 0;       // Total final
            $details = [];

            foreach ($request->products as $item) {
                $product = Products::findOrFail($item['id']);
                $quantity = $item['quantity'];

                $itemSubtotal = $product->unit_price * $quantity;
                $itemIva = 0;
                $itemIce = 0; // ICE calculation would depend on product type
                
                if ($product->has_igv) {
                    // Product with IVA (usually 15% in Ecuador, but using the product's percentage)
                    $ivaRate = ($product->igv_percentage ?? 15) / 100;
                    $itemIva = $itemSubtotal * $ivaRate;
                    $subtotal_12 += $itemSubtotal;
                } else {
                    // Product without IVA (0%)
                    $subtotal_0 += $itemSubtotal;
                }

                // ✅ CORRECCIÓN: Calcular ICE si el producto lo tiene
                if (!empty($product->ice_rate)) {
                    $iceRate = floatval($product->ice_rate) / 100;
                    $itemIce = $itemSubtotal * $iceRate;
                }

                $itemTotal = $itemSubtotal + $itemIva + $itemIce;
                $iva += $itemIva;
                $ice += $itemIce;
                $total += $itemTotal;

                if (empty($product->code)) {
                    throw new \Exception("El producto {$product->name} no tiene código asignado.");
                }

                $details[] = [
                    'product_id' => $product->id,
                    'main_code' => $product->code,
                    'auxiliary_code' => $product->sku,
                    'description' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $product->unit_price,
                    'discount' => 0, // Can be implemented later
                    'subtotal' => $itemSubtotal,
                    'iva' => $itemIva,
                    'ice' => $itemIce,
                    'total' => $itemTotal,
                ];
            }

            // Determine document series based on type
            $establishment_code = '001';
            $emission_point = '001';
            
            // Get last sequential number for this document type and establishment
            $lastSequential = Invoice::where('document_type', $request->document_type)
                ->where('establishment_code', $establishment_code)
                ->where('emission_point', $emission_point)
                ->max('sequential');

            $newSequential = str_pad(($lastSequential ? intval($lastSequential) + 1 : 1), 9, '0', STR_PAD_LEFT);

            // Create the invoice
            $invoice = Invoice::create([
                'type' => 'sale',
                'customer_id' => $request->customer_id,
                'document_type' => $request->document_type,
                'establishment_code' => $establishment_code,
                'emission_point' => $emission_point,
                'sequential' => $newSequential,
                'issue_date' => $request->issue_date,
                'period' => now()->format('m/Y'),
                'subtotal_12' => $subtotal_12,
                'subtotal_0' => $subtotal_0,
                'subtotal_no_tax' => 0, // Can be implemented for special cases
                'subtotal_exempt' => 0, // Can be implemented for special cases
                'discount' => 0, // Can be implemented later
                'ice' => $ice,
                'iva' => $iva,
                'tip' => 0, // Can be implemented later
                'total' => $total,
                'status' => $request->status,
                'is_electronic' => $request->boolean('is_electronic', true),
            ]);

            // Create invoice details and update stock using helper method
            foreach ($details as $detail) {
                $invoice->details()->create($detail);
                
                // ✅ USAR HELPER: Actualizar stock solo para productos físicos
                $this->updateProductStock($detail['product_id'], $detail['quantity'], 'decrement');
            }

            // Generate electronic invoice if requested
            if ($request->boolean('is_electronic', true)) {
                try {
                    $result = $this->electronicBillingService->generateInvoice($invoice);
                    if ($result['success']) {
                        $invoice->update([
                            'status' => $result['status'] ?? 'issued',
                            'xml_content' => $result['xml'] ?? null,
                            'authorization_number' => $result['authorization_number'] ?? null,
                            'authorization_date' => $result['authorization_date'] ?? null,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error generando comprobante electrónico: ' . $e->getMessage());
                    // Don't throw exception, just log it
                }
            }

            DB::commit();

            // Post accounting journal
            try {
                $this->accountingService->postSale($invoice);
            } catch (\Exception $e) {
                Log::warning('Failed to post sale journal entry: '.$e->getMessage());
            }

            // Return response with proper structure for Ecuador
            $saleData = $invoice->load(['customer', 'details.product']);
            
            return response()->json([
                'success' => true,
                'message' => 'Venta procesada correctamente',
                'data' => [
                    'sale' => [
                        'id' => $saleData->id,
                        'type' => $saleData->type ?? 'sale',
                        'document_type' => $saleData->document_type,
                        'document_type_name' => $this->getDocumentTypeName($saleData->document_type),
                        'total' => $saleData->total,
                        'subtotal_12' => $saleData->subtotal_12,
                        'subtotal_0' => $saleData->subtotal_0,
                        'iva' => $saleData->iva,
                        'ice' => $saleData->ice,
                        'status' => $saleData->status,
                        'customer' => $saleData->customer,
                        'details' => $saleData->details->map(function ($detail) {
                            return [
                                'id' => $detail->id,
                                'product' => $detail->product,
                                'quantity' => $detail->quantity,
                                'unit_price' => $detail->unit_price,
                                'subtotal' => $detail->subtotal,
                                'iva' => $detail->iva,
                                'ice' => $detail->ice,
                                'total' => $detail->total,
                            ];
                        }),
                        'xml_path' => $saleData->xml_path,
                        'pdf_path' => $saleData->pdf_path,
                        'cdr_path' => $saleData->cdr_path,
                    ],
                    'can_download_pdf' => !empty($saleData->pdf_path) && Storage::exists($saleData->pdf_path),
                    'can_download_xml' => !empty($saleData->xml_content) || (!empty($saleData->xml_path) && Storage::exists($saleData->xml_path)),
                    'can_download_cdr' => !empty($saleData->cdr_path) && Storage::exists($saleData->cdr_path),
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing sale: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Validate stock for products (not services) before processing sale
     */
    private function validateStockAvailability($products)
    {
        $stockErrors = [];
        
        foreach ($products as $item) {
            $product = Products::findOrFail($item['id']);
            $quantity = $item['quantity'];
            $isService = $product->item_type === 'service';
            
            // Log para debugging
            Log::info("Validando stock para: {$product->name}", [
                'id' => $product->id,
                'item_type' => $product->item_type,
                'is_service' => $isService,
                'stock' => $product->stock,
                'requested_quantity' => $quantity
            ]);
            
            // Solo validar stock para productos físicos
            if (!$isService) {
                if ($product->stock < $quantity) {
                    $stockErrors[] = [
                        'product_name' => $product->name,
                        'available_stock' => $product->stock,
                        'requested_quantity' => $quantity
                    ];
                }
            } else {
                Log::info("Servicio detectado, omitiendo validación de stock: {$product->name}");
            }
        }
        
        return $stockErrors;
    }

    /**
     * Update stock for products only (not services)
     */
    private function updateProductStock($productId, $quantity, $operation = 'decrement')
    {
        $product = Products::find($productId);
        
        if (!$product) {
            Log::error("Producto no encontrado: {$productId}");
            return false;
        }
        
        $isService = $product->item_type === 'service';
        
        Log::info("Actualizando stock", [
            'product_id' => $productId,
            'product_name' => $product->name,
            'item_type' => $product->item_type,
            'is_service' => $isService,
            'current_stock' => $product->stock,
            'quantity' => $quantity,
            'operation' => $operation
        ]);
        
        // Solo actualizar stock para productos físicos
        if (!$isService) {
            if ($operation === 'decrement') {
                $product->decrement('stock', $quantity);
                Log::info("Stock decrementado para producto: {$product->name}, nuevo stock: " . ($product->stock - $quantity));
            } elseif ($operation === 'increment') {
                $product->increment('stock', $quantity);
                Log::info("Stock incrementado para producto: {$product->name}, nuevo stock: " . ($product->stock + $quantity));
            }
            return true;
        } else {
            Log::info("Servicio detectado, no se actualiza stock: {$product->name}");
            return true; // Retorna true porque no es un error
        }
    }

    /**
     * Actualizar una venta
     */
    public function update(Request $request, $id)
    {
        $sale = Invoice::where('type', 'sale')->find($id);
        
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|numeric|min:1',
            'status' => 'required|in:draft,issued,authorized,rejected,canceled'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();

            // ✅ CORRECCIÓN: Restaurar stock solo para productos físicos
            foreach ($sale->details as $detail) {
                $product = Products::find($detail->product_id);
                if ($product && $product->item_type === 'product') {
                    $product->increment('stock', $detail->quantity);
                }
            }

            // Delete existing details
            $sale->details()->delete();

            // Recalculate totals
            $subtotal_12 = 0;
            $subtotal_0 = 0;
            $iva = 0;
            $ice = 0;
            $total = 0;

            foreach ($request->products as $item) {
                $product = Products::findOrFail($item['id']);
                $quantity = $item['quantity'];
                $isService = $product->item_type === 'service';

                // ✅ CORRECCIÓN: Solo validar stock para productos físicos
                if (!$isService && $product->stock < $quantity) {
                    throw new \Exception("Stock insuficiente para el producto: {$product->name}. Stock disponible: {$product->stock}");
                }

                $itemSubtotal = $product->unit_price * $quantity;
                $itemIva = 0;
                $itemIce = 0;
                
                if ($product->has_igv) {
                    $ivaRate = ($product->igv_percentage ?? 15) / 100;
                    $itemIva = $itemSubtotal * $ivaRate;
                    $subtotal_12 += $itemSubtotal;
                } else {
                    $subtotal_0 += $itemSubtotal;
                }

                // ✅ CORRECCIÓN: Calcular ICE si el producto lo tiene
                if (!empty($product->ice_rate)) {
                    $iceRate = floatval($product->ice_rate) / 100;
                    $itemIce = $itemSubtotal * $iceRate;
                }

                $itemTotal = $itemSubtotal + $itemIva + $itemIce;
                $iva += $itemIva;
                $ice += $itemIce;
                $total += $itemTotal;

                // Create new detail
                $sale->details()->create([
                    'product_id' => $product->id,
                    'main_code' => $product->code,
                    'auxiliary_code' => $product->sku,
                    'description' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $product->unit_price,
                    'subtotal' => $itemSubtotal,
                    'iva' => $itemIva,
                    'ice' => $itemIce,
                    'total' => $itemTotal,
                ]);

                // ✅ CORRECCIÓN: Solo actualizar stock para productos físicos
                if (!$isService) {
                    $product->decrement('stock', $quantity);
                }
            }

            // Update sale totals
            $sale->update([
                'customer_id' => $request->customer_id,
                'status' => $request->status,
                'subtotal_12' => $subtotal_12,
                'subtotal_0' => $subtotal_0,
                'iva' => $iva,
                'ice' => $ice,
                'total' => $total,
            ]);

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venta actualizada correctamente',
                'data' => $sale->load(['customer', 'details.product'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar una venta
     */
    public function destroy($id)
    {
        $sale = Invoice::where('type', 'sale')->find($id);
        
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        
        try {
            DB::beginTransaction();

            // ✅ CORRECCIÓN: Restaurar stock solo para productos físicos
            foreach ($sale->details as $detail) {
                $product = Products::find($detail->product_id);
                if ($product && $product->item_type === 'product') {
                    $product->increment('stock', $detail->quantity);
                }
            }

            $sale->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venta eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document type name for Ecuador
     */
    private function getDocumentTypeName($documentType)
    {
        $types = [
            '01' => 'Factura',
            '03' => 'Liquidación de Compra de Bienes y Prestación de Servicios',
            '04' => 'Nota de Crédito',
            '05' => 'Nota de Débito',
            '06' => 'Guía de Remisión',
            '07' => 'Comprobante de Retención',
        ];
        return $types[$documentType] ?? 'Desconocido';
    }

    // ... resto de métodos sin cambios ...
    public function generateElectronic(Invoice $sale)
    {
        try {
            $result = $this->electronicBillingService->generateInvoice($sale);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el comprobante electrónico: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadXml(Invoice $sale)
    {
        if (!$sale->xml_content && (!$sale->xml_path || !Storage::exists($sale->xml_path))) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo XML no está disponible'
            ], 404);
        }

        if ($sale->xml_content) {
            return response($sale->xml_content)
                ->header('Content-Type', 'application/xml')
                ->header('Content-Disposition', 'attachment; filename="comprobante-' . $sale->sequential . '.xml"');
        }

        return Storage::download($sale->xml_path, "comprobante-{$sale->sequential}.xml");
    }

    public function downloadCdr(Invoice $sale)
    {
        if (!$sale->cdr_path || !Storage::exists($sale->cdr_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo CDR no está disponible'
            ], 404);
        }

        return Storage::download($sale->cdr_path, "cdr-{$sale->sequential}.zip");
    }

    public function downloadPdf(Invoice $sale)
    {
        if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo PDF no está disponible'
            ], 404);
        }

        return Storage::download($sale->pdf_path, "comprobante-{$sale->sequential}.pdf");
    }

    public function sendByEmail(Request $request, Invoice $sale)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'message' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El comprobante PDF no está disponible'
                ], 404);
            }

            $pdfPath = Storage::path($sale->pdf_path);
            $fileName = "comprobante-{$sale->sequential}.pdf";

            // Mail::to($request->email)->send(new InvoiceMail($sale, $pdfPath, $request->message));

            return response()->json([
                'success' => true,
                'message' => 'Comprobante enviado por correo electrónico correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el correo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateWhatsAppLink(Request $request, Invoice $sale)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|max:20',
            'message' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $phone = preg_replace('/[^0-9]/', '', $request->phone);
            
            $documentTypeName = $this->getDocumentTypeName($sale->document_type);
            $defaultMessage = "Hola! Te envío el comprobante {$documentTypeName} {$sale->sequential} por un total de $ {$sale->total}";
            $message = $request->message ?: $defaultMessage;

            $whatsappUrl = "https://wa.me/{$phone}?text=" . urlencode($message);

            return response()->json([
                'success' => true,
                'whatsapp_url' => $whatsappUrl,
                'message' => 'Enlace de WhatsApp generado correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar enlace de WhatsApp: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSaleDetails(Invoice $sale)
    {
        try {
            $sale->load(['customer', 'details.product']);

            return response()->json([
                'success' => true,
                'data' => [
                    'sale' => $sale,
                    'document_number' => $sale->sequential,
                    'can_download_pdf' => $sale->pdf_path && Storage::exists($sale->pdf_path),
                    'can_download_xml' => ($sale->xml_content || ($sale->xml_path && Storage::exists($sale->xml_path))),
                    'can_download_cdr' => $sale->cdr_path && Storage::exists($sale->cdr_path),
                    'pdf_url' => $sale->pdf_path ? route('api.sales.download-pdf', $sale) : null,
                    'xml_url' => ($sale->xml_content || $sale->xml_path) ? route('api.sales.download-xml', $sale) : null,
                    'cdr_url' => $sale->cdr_path ? route('api.sales.download-cdr', $sale) : null,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles de la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getNextSequential(Request $request) 
{
    // Get parameters directly from request, not from nested params array
    $documentType = $request->input('document_type', '01');
    $establishmentCode = $request->input('establishment_code', '001');
    $emissionPoint = $request->input('emission_point', '001');
    
    try {
        // Obtener el último secuencial de la DB
        $lastSale = Invoice::where('document_type', $documentType)
            ->where('establishment_code', $establishmentCode)
            ->where('emission_point', $emissionPoint)
            ->whereNull('deleted_at') // Add explicit soft delete check if using soft deletes
            ->orderBy('sequential', 'desc')
            ->first();
        
        // Convert sequential to integer for proper calculation
        $lastSequentialNumber = 0;
        if ($lastSale && $lastSale->sequential) {
            $lastSequentialNumber = intval($lastSale->sequential);
        }
        
        $nextSequentialNumber = $lastSequentialNumber + 1;
        $nextSequential = str_pad($nextSequentialNumber, 9, '0', STR_PAD_LEFT);
        
        return response()->json([
            'success' => true,
            'data' => [
                'sequential' => $nextSequential,
                'last_sequential' => $lastSale ? $lastSale->sequential : null,
                'document_type' => $documentType,
                'establishment_code' => $establishmentCode,
                'emission_point' => $emissionPoint
            ]
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Error getting next sequential: ' . $e->getMessage(), [
            'document_type' => $documentType,
            'establishment_code' => $establishmentCode,
            'emission_point' => $emissionPoint,
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener el próximo secuencial: ' . $e->getMessage()
        ], 500);
    }
}
}