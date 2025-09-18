<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomersController extends Controller
{
    /**
     * List customers for the authenticated user's company with optional search.
     */
    // public function index(Request $request)
    // {
    //     $query = Customer::withCount('invoices')
    //         ->where('company_id', auth()->user()->company_id)
    //         ->orderBy('business_name');

    //     if ($search = $request->input('q')) {
    //         $query->where(function ($q) use ($search) {
    //             $q->where('business_name', 'like', "%{$search}%")
    //               ->orWhere('identification', 'like', "%{$search}%")
    //               ->orWhere('email', 'like', "%{$search}%");
    //         });
    //     }

    //     $customers = $query->paginate(10)->withQueryString();

    //     return Inertia::render('Tenant/Customers/Index', [
    //         'customers' => $customers,
    //         'filters' => $request->only('q'),
    //     ]);
    // }

    public function index(Request $request)
    {
        
        return Inertia::render('Tenant/Customers/Index');
    }

    /**
     * Show create form.
     */
    public function create()
    {
        $documentTypes = [
            ['value' => '01', 'label' => 'Cédula'],
            ['value' => '04', 'label' => 'RUC'],
            ['value' => '06', 'label' => 'Pasaporte'],
            ['value' => '07', 'label' => 'Consumidor final'],
            ['value' => '08', 'label' => 'Identificación del exterior'],
        ];

        return Inertia::render('Tenant/Customers/Create', [
            'document_types' => $documentTypes,
        ]);
    }

    /**
     * Store a new customer.
     */
    public function store(StoreCustomerRequest $request)
    {
        $data = $request->validated();
        $data['company_id'] = auth()->user()->company_id;

        Customer::create($data);

        return redirect()->route('customers.index')
            ->with('success', 'Cliente creado correctamente');
    }

    /**
     * Show a customer (with recent invoices).
     */
    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        $customer->load(['invoices' => function ($q) {
            $q->latest()->take(10);
        }]);

        return Inertia::render('Tenant/Customers/Show', [
            'customer' => $customer
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Customer $customer)
    {
        $this->authorize('update', $customer);

        $documentTypes = [
            ['value' => '01', 'label' => 'Cédula'],
            ['value' => '04', 'label' => 'RUC'],
            ['value' => '06', 'label' => 'Pasaporte'],
            ['value' => '07', 'label' => 'Consumidor final'],
            ['value' => '08', 'label' => 'Identificación del exterior'],
        ];

        return Inertia::render('Tenant/Customers/Edit', [
            'customer' => $customer,
            'document_types' => $documentTypes,
        ]);
    }

    /**
     * Update a customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        return redirect()->route('customers.index')
            ->with('success', 'Cliente actualizado correctamente');
    }

    /**
     * Delete a customer.
     */
    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Cliente eliminado correctamente');
    }
}
