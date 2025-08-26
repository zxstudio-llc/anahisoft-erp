<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Invoices;
use App\Models\Tenant\Customer;
use App\Models\Tenant\Products;
use App\Services\Tenant\InvoicesService;
use App\Services\Tenant\AccountingService;
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

    public function index()
    {
        $invoices = Invoices::with(['customer', 'company'])
            ->where('company_id', auth()->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Tenant/Invoices/Index', [
            'invoices' => $invoices
        ]);
    }

    public function create()
    {
        $customers = Customer::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Tenant/Invoices/Create', [
            'customers' => $customers,
            'products' => $products
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        DB::transaction(function () use ($request) {
            $invoice = $this->invoiceService->create($request->validated());
            $this->accountingService->createInvoiceJournalEntry($invoice);
        });

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice created successfully');
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);
        
        return Inertia::render('Tenant/Invoices/Show', [
            'invoice' => $invoice->load(['customer', 'details.product', 'sriDocument'])
        ]);
    }

    public function edit(Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.index')
                ->with('error', 'Cannot edit authorized invoice');
        }

        $customers = Customer::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Tenant/Invoices/Edit', [
            'invoice' => $invoice->load(['customer', 'details.product']),
            'customers' => $customers,
            'products' => $products
        ]);
    }

    public function authorize(Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Invoice is already processed');
        }

        try {
            $this->invoiceService->authorize($invoice);
            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice authorized successfully');
        } catch (\Exception $e) {
            return redirect()->route('invoices.show', $invoice)
                ->with('error', 'Authorization failed: ' . $e->getMessage());
        }
    }
}
