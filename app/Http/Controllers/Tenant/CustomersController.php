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
    public function index(Request $request)
    {
        $query = Customer::withCount('invoices')
            ->where('company_id', auth()->user()->company_id)
            ->orderBy('business_name');

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('identification', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->paginate(10)->withQueryString();

        return Inertia::render('Tenant/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only('q'),
        ]);
    }

    /**
     * Show create form.
     */
    public function create()
    {
        return Inertia::render('Tenant/Customers/Create');
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
            ->with('success', 'Customer created successfully');
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

        return Inertia::render('Tenant/Customers/Edit', [
            'customer' => $customer
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
            ->with('success', 'Customer updated successfully');
    }

    /**
     * Delete a customer.
     */
    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully');
    }
}
