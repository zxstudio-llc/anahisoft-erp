<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Purchase;
use App\Models\Tenant\Supplier;
use App\Models\Tenant\Products;
use App\Services\Tenant\PurchaseService;
use App\Services\Tenant\AccountingService;
use App\Http\Requests\StorePurchaseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use DB;

class PurchaseController extends Controller
{
    public function __construct(
        private PurchaseService $purchaseService,
        private AccountingService $accountingService
    ) {}

    public function index()
    {
        $purchases = Purchase::with(['supplier', 'company'])
            ->where('company_id', auth()->user()->company_id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Tenant/Purchases/Index', [
            'purchases' => $purchases
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Tenant/Purchases/Create', [
            'suppliers' => $suppliers,
            'products' => $products
        ]);
    }

    public function store(StorePurchaseRequest $request)
    {
        DB::transaction(function () use ($request) {
            $purchase = $this->purchaseService->create($request->validated());
            $this->accountingService->createPurchaseJournalEntry($purchase);
        });

        return redirect()->route('purchases.index')
            ->with('success', 'Purchase created successfully');
    }

    public function show(Purchase $purchase)
    {
        $this->authorize('view', $purchase);
        
        return Inertia::render('Tenant/Purchases/Show', [
            'purchase' => $purchase->load(['supplier', 'details.product', 'withholding'])
        ]);
    }

    public function edit(Purchase $purchase)
    {
        $this->authorize('update', $purchase);
        
        $suppliers = Supplier::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('business_name')
            ->get();

        $products = Products::where('company_id', auth()->user()->company_id)
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Tenant/Purchases/Edit', [
            'purchase' => $purchase->load(['supplier', 'details.product']),
            'suppliers' => $suppliers,
            'products' => $products
        ]);
    }
}
