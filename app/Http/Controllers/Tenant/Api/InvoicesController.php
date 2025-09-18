<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Http\Services\Tenant\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\Invoice;

class InvoicesController extends Controller
{
    protected InvoiceService $invoiceService;

    /**
     * Constructor
     */
    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Obtener estadísticas de uso de facturas
     */
    public function getUsageStatistics()
    {
        // Verificar si el tenant tiene una suscripción activa
        if (!$this->invoiceService->hasActiveSubscription()) {
            return response()->json([
                'success' => false,
                'message' => 'Su suscripción ha expirado o no está activa. Por favor, renueve su suscripción para continuar.',
                'subscription_expired' => true
            ], 403);
        }

        // Obtener estadísticas de uso
        $statistics = $this->invoiceService->getUsageStatistics();
        
        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Crear una nueva factura (incrementa el contador)
     */
    public function createInvoice(Request $request)
    {
        // Verificar si el tenant tiene una suscripción activa
        if (!$this->invoiceService->hasActiveSubscription()) {
            return response()->json([
                'success' => false,
                'message' => 'Su suscripción ha expirado o no está activa. Por favor, renueve su suscripción para continuar.',
                'subscription_expired' => true
            ], 403);
        }

        // Verificar si se ha alcanzado el límite
        if ($this->invoiceService->hasReachedLimit()) {
            $statistics = $this->invoiceService->getUsageStatistics();
            
            return response()->json([
                'success' => false,
                'message' => 'Ha alcanzado el límite de documentos permitido por su plan. Por favor, actualice su suscripción para continuar.',
                'limit_reached' => true,
                'statistics' => $statistics
            ], 403);
        }

        // Validar los datos de la factura
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:customers,id',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|numeric|min:0.01',
            'details.*.price' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Incrementar el contador de facturas
        $incremented = $this->invoiceService->incrementInvoiceCount();
        
        if (!$incremented) {
            return response()->json([
                'success' => false,
                'message' => 'Error al incrementar el contador de facturas'
            ], 500);
        }

        // En una implementación real, aquí se crearía la factura en la base de datos
        // Para este ejemplo, solo devolvemos un mensaje de éxito
        return response()->json([
            'success' => true,
            'message' => 'Factura creada correctamente',
            'invoice_id' => uniqid('INV-'),
            'created_at' => now()->format('Y-m-d H:i:s'),
            'statistics' => $this->invoiceService->getUsageStatistics()
        ], 201);
    }

    /**
     * Obtener información del plan de suscripción actual
     */
    public function getCurrentPlan()
    {
        $plan = $this->invoiceService->getCurrentSubscriptionPlan();
        
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene un plan de suscripción activo'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $plan
        ]);
    }
    
    /**
     * Verificar el estado de la suscripción del tenant actual
     */
    public function checkSubscriptionStatus()
    {
        $tenant = tenant();
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo obtener información del tenant'
            ], 500);
        }
        
        $status = [
            'is_active' => $tenant->is_active,
            'subscription_active' => $tenant->subscription_active,
            'on_trial' => $tenant->onTrial(),
            'has_active_subscription' => $tenant->hasActiveSubscription(),
            'trial_ends_at' => $tenant->trial_ends_at ? $tenant->trial_ends_at->format('Y-m-d') : null,
            'subscription_ends_at' => $tenant->subscription_ends_at ? $tenant->subscription_ends_at->format('Y-m-d') : null,
        ];
        
        // Añadir información del plan si existe
        if ($tenant->subscriptionPlan) {
            $status['plan'] = [
                'id' => $tenant->subscriptionPlan->id,
                'name' => $tenant->subscriptionPlan->name,
                'invoice_limit' => $tenant->subscriptionPlan->invoice_limit,
                'price' => $tenant->subscriptionPlan->price,
                'billing_period' => $tenant->subscriptionPlan->billing_period,
            ];
        }
        
        // Añadir estadísticas de uso
        if ($tenant->hasActiveSubscription()) {
            $status['usage'] = $this->invoiceService->getUsageStatistics();
        }
        
        return response()->json([
            'success' => true,
            'data' => $status
        ]);
    }

    /**
     * Listar facturas
     */
    public function index(Request $request)
    {
        $query = Invoice::query();
        
        // Obtener parámetros desde params[] o directamente
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $status = $params['status'] ?? $request->input('status');
        $dateFrom = $params['date_from'] ?? $request->input('date_from');
        $dateTo = $params['date_to'] ?? $request->input('date_to');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);
        
        // Filtros
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('document_number', 'like', "%{$search}%");
                  });
            });
        }
        
        if (!empty($status)) {
            $query->where('status', $status);
        }
        
        if (!empty($dateFrom)) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        
        if (!empty($dateTo)) {
            $query->whereDate('date', '<=', $dateTo);
        }
        
        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);
        
        // Paginación
        $invoices = $query->with(['customer', 'details.product'])->paginate($perPage)->withQueryString();
        
        return response()->json([
            'success' => true,
            'invoices' => $invoices,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'date_from' => $dateFrom ?? '',
                'date_to' => $dateTo ?? '',
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
        ]);
    }

    /**
     * Mostrar una factura
     */
    public function show($id)
    {
        $invoice = Invoice::with(['customer', 'details.product'])->find($id);
        
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Factura no encontrada'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    /**
     * Crear una nueva factura
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|numeric|min:1',
            'details.*.price' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $invoice = Invoice::create([
                'client_id' => $request->customer_id,
                'date' => $request->date,
                'status' => 'draft',
                'total' => 0,
            ]);
            
            $total = 0;
            foreach ($request->items as $item) {
                $subtotal = $item['quantity'] * $item['price'];
                $invoice->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);
                $total += $subtotal;
            }
            
            $invoice->update(['total' => $total]);
            
            return response()->json([
                'success' => true,
                'message' => 'Factura creada correctamente',
                'data' => $invoice->load(['customer', 'details.product'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la factura',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar una factura
     */
    public function update(Request $request, $id)
    {
        $invoice = Invoice::find($id);
        
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Factura no encontrada'
            ], 404);
        }
        
        if ($invoice->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden editar facturas en borrador'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|numeric|min:1',
            'details.*.price' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $invoice->update([
                'client_id' => $request->customer_id,
                'date' => $request->date,
            ]);
            
            // Eliminar items anteriores
            $invoice->items()->delete();
            
            // Crear nuevos items
            $total = 0;
            foreach ($request->items as $item) {
                $subtotal = $item['quantity'] * $item['price'];
                $invoice->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);
                $total += $subtotal;
            }
            
            $invoice->update(['total' => $total]);
            
            return response()->json([
                'success' => true,
                'message' => 'Factura actualizada correctamente',
                'data' => $invoice->load(['customer', 'details.product'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la factura',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar una factura
     */
    public function destroy($id)
    {
        $invoice = Invoice::find($id);
        
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Factura no encontrada'
            ], 404);
        }
        
        if ($invoice->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden eliminar facturas en borrador'
            ], 400);
        }
        
        try {
            $invoice->items()->delete();
            $invoice->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Factura eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la factura',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cambiar estado de una factura
     */
    public function updateStatus(Request $request, $id)
    {
        $invoice = Invoice::find($id);
        
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Factura no encontrada'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,issued,paid,cancelled',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $invoice->update(['status' => $request->status]);
            
            return response()->json([
                'success' => true,
                'message' => 'Estado de factura actualizado correctamente',
                'data' => $invoice->load(['customer', 'details.product'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado de la factura',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 