<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Purchase;
<<<<<<< HEAD
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
=======
use App\Models\Tenant\PurchaseItem;
use App\Models\Tenant\Provider;
use App\Models\Tenant\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Http\Services\Tenant\AccountingService;

class PurchaseController extends Controller
{
    protected AccountingService $accountingService;

    public function __construct()
    {
        $this->accountingService = new AccountingService();
    }

    public function index()
    {
        $purchases = Purchase::with('provider')->latest()->paginate(10);
        return Inertia::render('Tenant/Purchases/Index', [
            'purchases' => $purchases,
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
        ]);
    }

    public function create()
    {
<<<<<<< HEAD
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
=======
        return Inertia::render('Tenant/Purchases/Create', [
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'products' => Product::select('id', 'name', 'price', 'stock')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'issue_date' => 'required|date',
            'document_type' => 'required|string',
            'series' => 'nullable|string|max:20',
            'number' => 'nullable|string|max:20',
            'currency' => 'required|string|size:3',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $subtotal = 0; $tax = 0; $total = 0;
            foreach ($validated['items'] as $item) {
                $lineSubtotal = round($item['unit_price'] * $item['quantity'], 2);
                $lineTax = 0; // TODO: apply IVA based on product if needed
                $lineTotal = $lineSubtotal + $lineTax;
                $subtotal += $lineSubtotal; $tax += $lineTax; $total += $lineTotal;
            }

            $purchase = Purchase::create([
                'provider_id' => $validated['provider_id'],
                'issue_date' => $validated['issue_date'],
                'document_type' => $validated['document_type'],
                'series' => $validated['series'] ?? null,
                'number' => $validated['number'] ?? null,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'currency' => $validated['currency'],
                'status' => 'PENDING',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $lineSubtotal = round($item['unit_price'] * $item['quantity'], 2);
                $lineTax = 0;
                $lineTotal = $lineSubtotal + $lineTax;

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $lineSubtotal,
                    'tax' => $lineTax,
                    'total' => $lineTotal,
                ]);

                // Increase stock
                Product::where('id', $item['product_id'])->increment('stock', (int)$item['quantity']);
            }

            // Post accounting journal
            try {
                $this->accountingService->postPurchase($purchase);
            } catch (\Exception $e) {
                // swallow accounting errors to not block the purchase flow
            }

            return redirect()->route('tenant.purchases.show', $purchase)->with('success', 'Purchase created');
        });
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
    }

    public function show(Purchase $purchase)
    {
<<<<<<< HEAD
        $this->authorize('view', $purchase);
        
        return Inertia::render('Tenant/Purchases/Show', [
            'purchase' => $purchase->load(['supplier', 'details.product', 'withholding'])
=======
        $purchase->load(['provider', 'items.product']);
        return Inertia::render('Tenant/Purchases/Show', [
            'purchase' => $purchase,
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
        ]);
    }

    public function edit(Purchase $purchase)
    {
<<<<<<< HEAD
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
=======
        $purchase->load(['items']);
        return Inertia::render('Tenant/Purchases/Edit', [
            'purchase' => $purchase,
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'products' => Product::select('id', 'name', 'price', 'stock')->where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, Purchase $purchase)
    {
        // For simplicity, avoid item updates in this pass.
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'issue_date' => 'required|date',
            'document_type' => 'required|string',
            'series' => 'nullable|string|max:20',
            'number' => 'nullable|string|max:20',
            'currency' => 'required|string|size:3',
            'notes' => 'nullable|string',
        ]);
        $purchase->update($validated);
        return redirect()->route('tenant.purchases.show', $purchase)->with('success', 'Purchase updated');
    }

    public function destroy(Purchase $purchase)
    {
        // Rollback stock from items
        foreach ($purchase->items as $item) {
            Product::where('id', $item->product_id)->decrement('stock', (int)$item->quantity);
        }
        $purchase->delete();
        return redirect()->route('tenant.purchases.index')->with('success', 'Purchase deleted');
    }
}
>>>>>>> 36b421536fe0dbd5dc19fa8aa9cbdd4c97fb6f73
