<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Invoice;
use App\Models\Tenant\Customer;
use App\Models\Tenant\Products;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InvoiceSaleController extends Controller
{
    /**
     * Listar ventas
     */
    public function index()
    {
        $sales = Invoice::where('type', 'sale')
            ->with(['customer', 'details.product'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Tenant/Sales/Index', [
            'sales' => $sales,
        ]);
    }

    /**
     * Formulario de creación
     */
    public function create()
    {
        $clients = Customer::select('id', 'business_name', 'identification_type', 'identification')
            ->where('active', true)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'business_name' => $customer->business_name,
                    'identification_type' => $customer->identification_type,
                    'identification' => $customer->identification,
                ];
            });

        $products = Products::where('active', true)
            ->select('id', 'name', 'code', 'unit_price', 'stock', 'unit_type', 'has_igv', 'igv_percentage')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'unit_price' => $product->unit_price,
                    'price' => $product->unit_price, // For compatibility with React component
                    'stock' => $product->stock ?? 0,
                    'unit_type' => $product->unit_type,
                    'has_igv' => $product->has_igv,
                    'igv_percentage' => $product->igv_percentage ?? 12, // Default 12% for Ecuador
                ];
            });

        return Inertia::render('Tenant/Sales/Create', [
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    /**
     * Guardar venta - Redirect to API
     * This method should redirect to the API endpoint
     */
    public function store(Request $request)
    {
        // This should be handled by your frontend JavaScript
        // calling the API endpoint directly
        return redirect()->route('tenant.sales.index')
            ->with('info', 'Use the API endpoint for creating sales');
    }

    /**
     * Mostrar venta
     */
    public function show(Invoice $sale)
    {
        $sale->load(['customer', 'details.product']);

        return Inertia::render('Tenant/Sales/Show', [
            'sale' => $sale,
        ]);
    }

    /**
     * Formulario de edición
     */
    public function edit(Invoice $sale)
    {
        $sale->load(['customer', 'details.product']);

        $clients = Customer::select('id', 'business_name', 'identification_type', 'identification')
            ->where('active', true)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'business_name' => $customer->business_name,
                    'identification_type' => $customer->identification_type,
                    'identification' => $customer->identification,
                ];
            });

        $products = Products::where('active', true)
            ->select('id', 'name', 'code', 'unit_price', 'stock', 'unit_type', 'has_igv', 'igv_percentage')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'unit_price' => $product->unit_price,
                    'price' => $product->unit_price,
                    'stock' => $product->stock ?? 0,
                    'unit_type' => $product->unit_type,
                    'has_igv' => $product->has_igv,
                    'igv_percentage' => $product->igv_percentage ?? 12,
                ];
            });

        return Inertia::render('Tenant/Sales/Edit', [
            'sale' => $sale,
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    /**
     * Actualizar venta - Redirect to API
     */
    public function update(Request $request, Invoice $sale)
    {
        // This should be handled by your frontend JavaScript
        // calling the API endpoint directly
        return redirect()->route('tenant.sales.index')
            ->with('info', 'Use the API endpoint for updating sales');
    }

    /**
     * Eliminar venta - Redirect to API
     */
    public function destroy(Invoice $sale)
    {
        // This should be handled by your frontend JavaScript
        // calling the API endpoint directly
        return redirect()->route('tenant.sales.index')
            ->with('info', 'Use the API endpoint for deleting sales');
    }

    /**
     * Generar comprobante electrónico - Web action
     */
    public function generateElectronic(Invoice $sale)
    {
        // Call API endpoint and redirect back
        try {
            $response = app('App\Http\Controllers\Tenant\Api\InvoiceSaleController')
                ->generateElectronic($sale);
            
            $data = $response->getData(true);
            
            return redirect()->back()->with(
                $data['success'] ? 'success' : 'error', 
                $data['message']
            );
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al generar el comprobante electrónico');
        }
    }

    /**
     * Descargar XML
     */
    public function downloadXml(Invoice $sale)
    {
        if (!$sale->xml_content && (!$sale->xml_path || !Storage::exists($sale->xml_path))) {
            return redirect()->back()->with('error', 'El archivo XML no está disponible');
        }
        
        if ($sale->xml_content) {
            return response($sale->xml_content)
                ->header('Content-Type', 'application/xml')
                ->header('Content-Disposition', 'attachment; filename="comprobante-' . $sale->sequential . '.xml"');
        }
        
        return Storage::download($sale->xml_path, "comprobante-{$sale->sequential}.xml");
    }

    /**
     * Descargar PDF
     */
    public function downloadPdf(Invoice $sale)
    {
        if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
            return redirect()->back()->with('error', 'El archivo PDF no está disponible');
        }
        
        return Storage::download($sale->pdf_path, "comprobante-{$sale->sequential}.pdf");
    }

    /**
     * Descargar CDR
     */
    public function downloadCdr(Invoice $sale)
    {
        if (!$sale->cdr_path || !Storage::exists($sale->cdr_path)) {
            return redirect()->back()->with('error', 'El archivo CDR no está disponible');
        }
        
        return Storage::download($sale->cdr_path, "cdr-{$sale->sequential}.zip");
    }

    public function getNextInvoiceNumber(Request $request)
    {
        $request->validate([
            'document_type' => 'required|in:01,03'
        ]);

        $establishment_code = '001';
        $emission_point = '001';
        
        $lastSequential = Invoice::where('document_type', $request->document_type)
            ->where('establishment_code', $establishment_code)
            ->where('emission_point', $emission_point)
            ->max('sequential');

        $newSequential = str_pad(($lastSequential ? intval($lastSequential) + 1 : 1), 9, '0', STR_PAD_LEFT);

        $invoiceNumber = "{$establishment_code}-{$emission_point}-{$newSequential}";

        return response()->json([
            'success' => true,
            'data' => $invoiceNumber
        ]);
    }
}