<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Sale;
use App\Models\Tenant\Client;
use App\Models\Tenant\Product;
use App\Models\Tenant\Settings;
use App\Http\Services\Tenant\ElectronicBillingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SaleController extends Controller
{
    protected $electronicBillingService;
    protected $settings;

    public function __construct(ElectronicBillingService $electronicBillingService)
    {
        $this->electronicBillingService = $electronicBillingService;
        $this->settings = Settings::first();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with(['client', 'products'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Tenant/Sales/Index', [
            'sales' => $sales,
            'settings' => $this->settings
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clients = Client::select('id', 'name', 'document_type', 'document_number')->get();
        $products = Product::with('category')
            ->select('id', 'name', 'code', 'price', 'stock', 'unit_type', 'igv_type', 'igv_percentage', 'has_igv')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Tenant/Sales/Create', [
            'clients' => $clients,
            'products' => $products,
            'settings' => $this->settings
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'document_type' => 'required|in:01,03', // 01: Factura, 03: Boleta
            'is_electronic' => 'required|boolean'
        ]);

        try {
            DB::beginTransaction();

            // Calcular totales
            $subtotal = 0;
            $igv = 0;
            $total = 0;

            $productDetails = [];
            foreach ($request->products as $item) {
                $product = Product::find($item['id']);
                $quantity = $item['quantity'];

                $itemSubtotal = $product->price_without_igv * $quantity;
                $itemIgv = $product->igv_amount * $quantity;
                $itemTotal = $itemSubtotal + $itemIgv;

                $subtotal += $itemSubtotal;
                $igv += $itemIgv;
                $total += $itemTotal;

                $productDetails[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $product->price_with_igv,
                    'subtotal' => $itemSubtotal,
                    'igv' => $itemIgv,
                    'total' => $itemTotal
                ];
            }

            // Determinar serie según tipo de documento
            $series = $request->document_type === '01' ? 
                $this->settings->invoice_series : 
                $this->settings->receipt_series;

            // Obtener último número de la serie
            $lastNumber = Sale::where('series', $series)
                ->where('document_type', $request->document_type)
                ->max('number') ?? 0;

            // Crear venta
            $sale = Sale::create([
                'client_id' => $request->client_id,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'status' => 'PENDIENTE',
                'notes' => $request->notes,
                'document_type' => $request->document_type,
                'series' => $series,
                'number' => $lastNumber + 1,
                'is_electronic' => $request->is_electronic,
                'environment' => $this->settings->sunat_mode
            ]);

            // Asociar productos
            foreach ($productDetails as $detail) {
                $sale->products()->attach($detail['product_id'], [
                    'quantity' => $detail['quantity'],
                    'price' => $detail['price'],
                    'subtotal' => $detail['subtotal'],
                    'igv' => $detail['igv'],
                    'total' => $detail['total']
                ]);

                // Actualizar stock
                Product::find($detail['product_id'])->decrement('stock', $detail['quantity']);
            }

            // Si es electrónico, generar comprobante
            if ($request->is_electronic) {
                $result = $this->electronicBillingService->generateInvoice($sale);
                
                if (!$result['success']) {
                    throw new \Exception($result['message']);
                }
            }

            DB::commit();

            // Recargar la venta con sus relaciones
            $sale->load(['client', 'products']);

            // Verificar existencia de archivos
            $canDownloadPdf = $sale->pdf_path && Storage::exists($sale->pdf_path);
            $canDownloadXml = $sale->xml_path && Storage::exists($sale->xml_path);
            $canDownloadCdr = $sale->cdr_path && Storage::exists($sale->cdr_path);

            return response()->json([
                'success' => true,
                'message' => 'Venta procesada correctamente',
                'data' => [
                    'sale' => $sale,
                    'document_number' => $sale->document_number,
                    'can_download_pdf' => $canDownloadPdf,
                    'can_download_xml' => $canDownloadXml,
                    'can_download_cdr' => $canDownloadCdr
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load(['client', 'products']);

        return Inertia::render('Tenant/Sales/Show', [
            'sale' => $sale,
            'settings' => $this->settings
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        $sale->load(['client', 'products']);

        return Inertia::render('Tenant/Sales/Edit', [
            'sale' => $sale,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'products' => ['required', 'array', 'min:1'],
            'products.*.id' => ['required', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:pending,completed,cancelled'],
        ]);

        $sale->update([
            'client_id' => $request->client_id,
            'total' => $request->total,
            'status' => $request->status,
        ]);

        $sale->products()->sync(
            collect($request->products)->mapWithKeys(function ($item) {
                return [$item['id'] => ['quantity' => $item['quantity']]];
            })->all()
        );

        return redirect()->route('tenant.sales.index')
            ->with('success', 'Venta actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();

        return redirect()->route('tenant.sales.index')
            ->with('success', 'Venta eliminada correctamente.');
    }

    public function generateElectronic(Sale $sale)
    {
        try {
            $result = $this->electronicBillingService->generateInvoice($sale);

            if ($result['success']) {
                return redirect()->back()->with('success', 'Comprobante electrónico generado correctamente');
            }

            return redirect()->back()->with('error', $result['message']);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al generar el comprobante electrónico: ' . $e->getMessage());
        }
    }

    public function downloadXml(Sale $sale)
    {
        if (!$sale->xml_path || !Storage::exists($sale->xml_path)) {
            return redirect()->back()->with('error', 'El archivo XML no está disponible');
        }

        return Storage::download($sale->xml_path, "comprobante-{$sale->document_number}.xml");
    }

    public function downloadCdr(Sale $sale)
    {
        if (!$sale->cdr_path || !Storage::exists($sale->cdr_path)) {
            return redirect()->back()->with('error', 'El archivo CDR no está disponible');
        }

        return Storage::download($sale->cdr_path, "cdr-{$sale->document_number}.zip");
    }

    public function downloadPdf(Sale $sale)
    {
        if (!$sale->pdf_path || !Storage::exists($sale->pdf_path)) {
            return redirect()->back()->with('error', 'El archivo PDF no está disponible');
        }

        return Storage::download($sale->pdf_path, "comprobante-{$sale->document_number}.pdf");
    }
}