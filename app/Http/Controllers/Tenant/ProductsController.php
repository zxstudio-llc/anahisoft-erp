<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Products;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductsController extends Controller
{
    public function index()
    {
        $products = Products::where('company_id', auth()->user()->company_id)
            ->orderBy('name')
            ->paginate(10);

        return Inertia::render('Tenant/Products/Index', [
            'products' => $products
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenant/Products/Create');
    }

    public function store(StoreProductRequest $request)
    {
        Products::create([
            'company_id' => auth()->user()->company_id,
            ...$request->validated()
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully');
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);
        
        return Inertia::render('Tenant/Products/Show', [
            'product' => $product
        ]);
    }

    public function edit(Product $product)
    {
        $this->authorize('update', $product);
        
        return Inertia::render('Tenant/Products/Edit', [
            'product' => $product
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);
        
        $product->update($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully');
    }
}
