<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::with('company')
            ->where('company_id', auth()->user()->company_id)
            ->orderBy('business_name')
            ->paginate(10);

        return Inertia::render('Tenant/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenant/Suppliers/Create');
    }

    public function store(StoreSupplierRequest $request)
    {
        Supplier::create([
            'company_id' => auth()->user()->company_id,
            ...$request->validated()
        ]);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier created successfully');
    }

    public function show(Supplier $supplier)
    {
        $this->authorize('view', $supplier);
        
        return Inertia::render('Tenant/Suppliers/Show', [
            'supplier' => $supplier->load(['purchases' => fn($q) => $q->latest()->take(10)])
        ]);
    }

    public function edit(Supplier $supplier)
    {
        $this->authorize('update', $supplier);
        
        return Inertia::render('Tenant/Suppliers/Edit', [
            'supplier' => $supplier
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $this->authorize('update', $supplier);
        
        $supplier->update($request->validated());

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier updated successfully');
    }

    public function destroy(Supplier $supplier)
    {
        $this->authorize('delete', $supplier);
        
        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully');
    }
}

