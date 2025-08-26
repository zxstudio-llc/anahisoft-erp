<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Company;
use App\Http\Requests\UpdateCompanyRequest;
use Inertia\Inertia;

class CompaniesController extends Controller
{
    public function index()
    {
        $companies = Company::query()
            ->when(!auth()->user()->is_admin ?? false, fn($q) => $q->where('id', auth()->user()->company_id))
            ->paginate(10);

        return Inertia::render('Tenant/Companies/Index', [ 'companies' => $companies ]);
    }

    public function show(Company $company)
    {
        $this->authorize('view', $company);
        return Inertia::render('Tenant/Companies/Show', ['company' => $company]);
    }

    public function edit(Company $company)
    {
        $this->authorize('update', $company);
        return Inertia::render('Tenant/Companies/Edit', ['company' => $company]);
    }

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $this->authorize('update', $company);
        $company->update($request->validated());
        return redirect()->route('companies.show', $company)->with('success', 'Company updated successfully');
    }
}