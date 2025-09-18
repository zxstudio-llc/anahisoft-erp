<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Invoice;
use App\Models\Tenant\Customer;
use App\Models\Tenant\Products;
use Illuminate\Support\Facades\Gate;
use App\Http\Services\Tenant\InvoicesService;
use App\Http\Services\Tenant\AccountingService;
use App\Http\Requests\StoreInvoiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use DB;

class InvoicesController extends Controller
{
    public function __construct(
        private InvoicesService $invoiceService,
        private AccountingService $accountingService
    ) {}

    public function index(Request $request)
    {
        $query = Invoice::with(['customer']);

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('sequential', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('business_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transformar datos para el frontend
        $invoices->getCollection()->transform(function ($invoice) {
            return [
                'id' => $invoice->id,
                'number' => $invoice->establishment_code . '-' . 
                           $invoice->emission_point . '-' . 
                           $invoice->sequential,
                'client_name' => $invoice->customer->business_name ?? 'Sin cliente',
                'date' => $invoice->issue_date,
                'total' => $invoice->total,
                'status' => $invoice->status,
                'access_key' => $invoice->access_key,
            ];
        });

        return Inertia::render('Tenant/Invoices/Index', [
            'invoices' => $invoices->items(),
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ]
        ]);
    }

    public function create()
    {
        $customers = Customer::where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('active', true) // Cambié "Products" por "Product"
            ->orderBy('name')
            ->get();


        return Inertia::render('Tenant/Invoices/Create', [
            'clients' => $customers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        // Implementar la lógica para almacenar una nueva factura
        return redirect()->route('tenant.invoices.index')->with('success', 'Factura creada correctamente');
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('Tenant/Invoices/Show', [
            'invoice' => $invoice->load(['customer', 'details.product', 'sriDocument'])
        ]);
    }

    public function edit(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.index')
                ->with('error', 'No se puede editar una factura autorizada');
        }

        $customers = Customer::where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Tenant/Invoices/Edit', [
            'invoice' => $invoice->load(['customer', 'details.product']),
            'customers' => $customers,
            'products' => $products
        ]);
    }

    public function update(StoreInvoiceRequest $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.index')
                ->with('error', 'No se puede editar una factura autorizada');
        }

        try {
            DB::transaction(function () use ($request, $invoice) {
                // Eliminar detalles existentes
                $invoice->details()->delete();
                
                // Recrear la factura con los nuevos datos
                $data = $request->validated();
                $data['invoice_id'] = $invoice->id;
                
                $this->invoiceService->update($invoice, $data);
            });

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Factura actualizada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar la factura: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function authorizeInvoice(Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'La factura ya fue procesada');
        }

        try {
            $this->invoiceService->authorize($invoice);
            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Factura autorizada exitosamente');
        } catch (\Exception $e) {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Error en la autorización: ' . $e->getMessage());
        }
    }

    public function downloadPDF(Invoice $invoice)
    {        
        // Generar y descargar PDF
        $pdf = $this->invoiceService->generatePDF($invoice);
        
        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="factura-' . $invoice->sequential . '.pdf"');
    }

    public function sendEmail(Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
        try {
            $this->invoiceService->sendByEmail($invoice);
            return redirect()->back()
                ->with('success', 'Factura enviada por email exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al enviar email: ' . $e->getMessage());
        }
    }

    public function duplicate(Invoice $invoice)
    {        
        try {
            $newInvoice = $this->invoiceService->duplicate($invoice);
            return redirect()->route('invoices.edit', $newInvoice)
                ->with('success', 'Factura duplicada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al duplicar factura: ' . $e->getMessage());
        }
    }

    public function cancel(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);
        
        try {
            $this->invoiceService->cancel($invoice);
            return redirect()->route('invoices.index')
                ->with('success', 'Factura cancelada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al cancelar factura: ' . $e->getMessage());
        }
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);
        
        if ($invoice->status === 'authorized') {
            return redirect()->back()
                ->with('error', 'No se puede eliminar una factura autorizada');
        }

        try {
            DB::transaction(function () use ($invoice) {
                // Restaurar stock si es necesario
                foreach ($invoice->details as $detail) {
                    if ($detail->product && ($detail->product->track_inventory ?? false)) {
                        $detail->product->increment('stock', $detail->quantity);
                    }
                }
                
                $invoice->delete();
            });

            return redirect()->route('invoices.index')
                ->with('success', 'Factura eliminada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al eliminar factura: ' . $e->getMessage());
        }
    }
}
