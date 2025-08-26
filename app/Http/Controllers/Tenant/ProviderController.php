<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderController extends Controller
{
    public function index()
    {
        $providers = Provider::latest()->paginate(10);
        return Inertia::render('Tenant/Providers/Index', [
            'providers' => $providers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenant/Providers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'nullable|string|max:2',
            'document_number' => 'required|string|max:20|unique:providers,document_number',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'canton' => 'nullable|string|max:100',
            'parish' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
            'payment_terms' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        Provider::create($validated);

        return redirect()->route('tenant.providers.index')->with('success', 'Provider created successfully');
    }

    public function show(Provider $provider)
    {
        return Inertia::render('Tenant/Providers/Show', [
            'provider' => $provider,
        ]);
    }

    public function edit(Provider $provider)
    {
        return Inertia::render('Tenant/Providers/Edit', [
            'provider' => $provider,
        ]);
    }

    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'nullable|string|max:2',
            'document_number' => 'required|string|max:20|unique:providers,document_number,' . $provider->id,
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'canton' => 'nullable|string|max:100',
            'parish' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
            'payment_terms' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $provider->update($validated);

        return redirect()->route('tenant.providers.index')->with('success', 'Provider updated successfully');
    }

    public function destroy(Provider $provider)
    {
        $provider->delete();
        return redirect()->route('tenant.providers.index')->with('success', 'Provider deleted successfully');
    }
}