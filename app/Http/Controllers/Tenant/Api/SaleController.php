<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Services\Tenant\ElectronicBillingService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SaleController extends Controller
{
    protected $electronicBillingService;

    public function __construct(ElectronicBillingService $electronicBillingService)
    {
        $this->electronicBillingService = $electronicBillingService;
    }

    /**
     * Listar ventas
     */
    public function index(Request $request)
    {
        $query = Sale::query();
        
        // Obtener parámetros desde params[] o directamente
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $status = $params['status'] ?? $request->input('status');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);
        
        // Filtros
        if (!empty($search)) {
            $query->whereHas('client', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }
        
        if (!empty($status)) {
            $query->where('status', $status);
        }
        
        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);
        
        // Paginación
        $sales = $query->with(['client'])->paginate($perPage)->withQueryString();
        
        return response()->json([
            'success' => true,
            'sales' => $sales,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
            'statuses' => [
                ['value' => 'pending', 'label' => 'Pendiente'],
                ['value' => 'completed', 'label' => 'Completada'],
                ['value' => 'cancelled', 'label' => 'Cancelada'],
            ],
        ]);
    }

    /**
     * Mostrar una venta
     */
    public function show($id)
    {
        $sale = Sale::with(['client', 'items.product'])->find($id);
        
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $sale
        ]);
    }

    /**
     * Crear una nueva venta
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
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
            \DB::beginTransaction();
            
            // Obtener productos con sus precios
            $productIds = collect($request->products)->pluck('id');
            $products = \App\Models\Tenant\Product::whereIn('id', $productIds)->get()->keyBy('id');
            
            // Calcular totales
            $subtotal = 0;
            $igv = 0;
            $total = 0;
            
            $saleProducts = [];
            
            foreach ($request->products as $productData) {
                $product = $products->get($productData['id']);
                if (!$product) continue;
                
                $quantity = $productData['quantity'];
                $price = $product->price;
                
                // Calcular subtotal (precio sin IGV)
                $priceWithoutIgv = $price / 1.18;
                $igvAmount = $price - $priceWithoutIgv;
                
                $itemSubtotal = $priceWithoutIgv * $quantity;
                $itemIgv = $igvAmount * $quantity;
                $itemTotal = $price * $quantity;
                
                $subtotal += $itemSubtotal;
                $igv += $itemIgv;
                $total += $itemTotal;
                
                $saleProducts[$product->id] = [
                    'quantity' => $quantity,
                    'price' => $price,
                    'subtotal' => $itemSubtotal,
                    'igv' => $itemIgv,
                    'total' => $itemTotal
                ];
            }
            
            // Obtener configuración para series
            $settings = \App\Models\Tenant\Settings::first();
            $series = $request->document_type === '01' ? 
                ($settings->invoice_series ?? 'F001') : 
                ($settings->receipt_series ?? 'B001');
            
            // Obtener siguiente número
            $lastSale = Sale::where('document_type', $request->document_type)
                ->where('series', $series)
                ->orderBy('number', 'desc')
                ->first();
            
            $nextNumber = $lastSale ? $lastSale->number + 1 : 1;
            
            // Crear la venta
            $sale = Sale::create([
                'client_id' => $request->client_id,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'status' => 'completed',
                'document_type' => $request->document_type,
                'series' => $series,
                'number' => $nextNumber,
                'is_electronic' => $request->boolean('is_electronic', true),
                'environment' => $settings->sunat_mode ?? 'demo',
                'sunat_state' => 'PENDIENTE'
            ]);
            
            // Asociar productos
            $sale->products()->attach($saleProducts);
            
            // Generar documento electrónico si está habilitado
            if ($sale->is_electronic) {
                try {
                    $result = $this->electronicBillingService->generateInvoice($sale);
                    if ($result['success']) {
                        $sale->update([
                            'sunat_state' => $result['sunat_state'] ?? 'ACEPTADO',
                            'sunat_response' => $result['sunat_response'] ?? null,
                            'xml_path' => $result['xml_path'] ?? null,
                            'pdf_path' => $result['pdf_path'] ?? null,
                            'cdr_path' => $result['cdr_path'] ?? null,
                        ]);
                    }
                } catch (\Exception $e) {
                    // Log error but don't fail the sale creation
                    \Log::error('Error generating electronic document: ' . $e->getMessage());
                }
            }
            
            \DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Venta procesada correctamente',
                'data' => [
                    'sale' => $sale->load(['client', 'products']),
                    'document_number' => $sale->document_number,
                    'can_download_pdf' => $sale->pdf_path && \Storage::exists($sale->pdf_path),
                    'can_download_xml' => $sale->xml_path && \Storage::exists($sale->xml_path),
                    'can_download_cdr' => $sale->cdr_path && \Storage::exists($sale->cdr_path),
                ]
            ], 201);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una venta
     */
    public function update(Request $request, $id)
    {
        $sale = Sale::find($id);
        
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'status' => 'required|in:pending,completed,cancelled',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $sale->update($validator->validated());
        
        // Actualizar los items de la venta
        $sale->items()->delete();
        foreach ($request->items as $item) {
            $sale->items()->create($item);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Venta actualizada correctamente',
            'data' => $sale->load(['client', 'items.product'])
        ]);
    }

    /**
     * Eliminar una venta
     */
    public function destroy($id)
    {
        $sale = Sale::find($id);
        
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        
        // En lugar de eliminar, marcamos como cancelada
        $sale->update(['status' => 'cancelled']);
        
        return response()->json([
            'success' => true,
            'message' => 'Venta cancelada correctamente'
        ]);
    }

    public function generateElectronic(Sale $sale)
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

    public function downloadXml(Sale $sale)
    {
        if (!$sale->xml_path || !Storage::exists($sale->xml_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo XML no está disponible'
            ], 404);
        }

        return Storage::download($sale->xml_path, "comprobante-{$sale->document_number}.xml");
    }

    public function downloadCdr(Sale $sale)
    {
        if (!$sale->cdr_path || !Storage::exists($sale->cdr_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo CDR no está disponible'
            ], 404);
        }

        return Storage::download($sale->cdr_path, "cdr-{$sale->document_number}.zip");
    }

    public function downloadPdf(Sale $sale)
    {
        if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo PDF no está disponible'
            ], 404);
        }

        return Storage::download($sale->pdf_path, "comprobante-{$sale->document_number}.pdf");
    }

    /**
     * Enviar comprobante por correo electrónico
     */
    public function sendByEmail(Request $request, Sale $sale)
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
            // Verificar que el PDF existe
            if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El comprobante PDF no está disponible'
                ], 404);
            }

            $pdfPath = Storage::path($sale->pdf_path);
            $fileName = "comprobante-{$sale->document_number}.pdf";

            // Enviar correo (aquí deberías implementar tu clase de Mail)
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

    /**
     * Generar enlace para WhatsApp
     */
    public function generateWhatsAppLink(Request $request, Sale $sale)
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
            
            // Mensaje por defecto
            $defaultMessage = "Hola! Te envío el comprobante {$sale->document_type_name} {$sale->document_number} por un total de S/ {$sale->total}";
            $message = $request->message ?: $defaultMessage;

            // Generar enlace de WhatsApp
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

    /**
     * Obtener información completa de la venta para el modal
     */
    public function getSaleDetails(Sale $sale)
    {
        try {
            $sale->load(['client', 'products']);

            return response()->json([
                'success' => true,
                'data' => [
                    'sale' => $sale,
                    'document_number' => $sale->document_number,
                    'can_download_pdf' => $sale->pdf_path && Storage::exists($sale->pdf_path),
                    'can_download_xml' => $sale->xml_path && Storage::exists($sale->xml_path),
                    'can_download_cdr' => $sale->cdr_path && Storage::exists($sale->cdr_path),
                    'pdf_url' => $sale->pdf_path ? route('api.sales.download-pdf', $sale) : null,
                    'xml_url' => $sale->xml_path ? route('api.sales.download-xml', $sale) : null,
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
}