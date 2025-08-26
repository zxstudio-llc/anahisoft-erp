<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChartOfAccountRequest;
use App\Models\Tenant\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountsController extends Controller
{
    public function index(Request $request)
    {
        $companyId = tenant()->id; // asegúrate de que tengas un helper tenant()

        $accounts = ChartOfAccount::where('company_id', $companyId)
            ->with('parent')
            ->orderBy('code')
            ->paginate(20);

        return Inertia::render('Tenant/ChartOfAccounts/Index', [
            'accounts' => $accounts
        ]);
    }

    public function create()
    {
        $companyId = tenant()->id;

        $parents = ChartOfAccount::where('company_id', $companyId)
            ->where('is_detail', false)
            ->get();

        return Inertia::render('Tenant/ChartOfAccounts/Create', [
            'parents' => $parents
        ]);
    }

    public function store(ChartOfAccountRequest $request)
    {
        $companyId = tenant()->id;

        ChartOfAccount::create([
            'company_id' => $companyId,
            'code' => $request->code,
            'name' => $request->name,
            'account_type' => $request->account_type,
            'account_subtype' => $request->account_subtype,
            'parent_code' => $request->parent_code,
            'level' => $request->level,
            'is_detail' => $request->is_detail ?? false,
            'initial_balance' => $request->initial_balance ?? 0,
            'active' => $request->active ?? true,
        ]);

        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Cuenta contable creada correctamente.');
    }

    public function edit(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('update', $chartOfAccount);

        $companyId = tenant()->id;

        $parents = ChartOfAccount::where('company_id', $companyId)
            ->where('is_detail', false)
            ->where('code', '<>', $chartOfAccount->code)
            ->get();

        return Inertia::render('Tenant/ChartOfAccounts/Edit', [
            'account' => $chartOfAccount,
            'parents' => $parents
        ]);
    }

    public function update(ChartOfAccountRequest $request, ChartOfAccount $chartOfAccount)
    {
        $this->authorize('update', $chartOfAccount);

        $chartOfAccount->update($request->validated());

        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Cuenta contable actualizada correctamente.');
    }

    public function destroy(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('delete', $chartOfAccount);

        if ($chartOfAccount->children()->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar una cuenta que tiene subcuentas.']);
        }

        $chartOfAccount->delete();

        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Cuenta contable eliminada correctamente.');
    }
}
