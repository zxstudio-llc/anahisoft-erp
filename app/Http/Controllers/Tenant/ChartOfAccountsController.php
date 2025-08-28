<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChartOfAccountRequest;
use App\Models\Tenant\ChartOfAccount;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ChartOfAccountsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountsController extends Controller
{
    /**
     * Obtener el company_id activo desde sesión (nullable)
     */
    protected function getCompanyId(): ?int
    {
        return session('active_company_id'); // Puede ser null si no hay sucursal activa
    }

    /**
     * Listar cuentas contables
     */
    public function index(Request $request)
    {
        $companyId = $this->getCompanyId();

        // Traer cuentas globales + cuentas de la sucursal activa
        $accounts = ChartOfAccount::with('parent')
            ->whereNull('company_id')
            ->orWhere('company_id', $companyId)
            ->orderBy('code')
            ->get();

        return Inertia::render('Tenant/ChartOfAccounts/Index', [
            'accounts' => $accounts
        ]);
    }

    public function import(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls,csv',
    ]);

    Excel::import(new ChartOfAccountsImport, $request->file('file'));

    return redirect()->route('tenant.chart-of-accounts.index')
                     ->with('success', 'Plan de cuentas importado correctamente.');
}

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        $companyId = $this->getCompanyId();

        $parents = ChartOfAccount::whereNull('company_id')
            ->orWhere('company_id', $companyId)
            ->where('is_detail', false)
            ->get();

        return Inertia::render('Tenant/ChartOfAccounts/Create', [
            'parents' => $parents
        ]);
    }

    /**
     * Guardar nueva cuenta contable
     */
    public function store(ChartOfAccountRequest $request)
    {
        $companyId = $this->getCompanyId();

        ChartOfAccount::create([
            'company_id' => $companyId, // puede ser null para cuenta global
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

        return redirect()->route('tenant.chart-of-accounts.index')
            ->with('success', 'Cuenta contable creada correctamente.');
    }

    /**
     * Editar cuenta contable
     */
    public function edit(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('update', $chartOfAccount);

        $companyId = $this->getCompanyId();

        $parents = ChartOfAccount::whereNull('company_id')
            ->orWhere('company_id', $companyId)
            ->where('is_detail', false)
            ->where('code', '<>', $chartOfAccount->code)
            ->get();

        return Inertia::render('Tenant/ChartOfAccounts/Edit', [
            'account' => $chartOfAccount,
            'parents' => $parents
        ]);
    }

    /**
     * Actualizar cuenta contable
     */
    public function update(ChartOfAccountRequest $request, ChartOfAccount $chartOfAccount)
    {
        $this->authorize('update', $chartOfAccount);

        $companyId = $this->getCompanyId();

        // Solo permitir actualizar cuentas globales o de la sucursal activa
        if ($chartOfAccount->company_id && $chartOfAccount->company_id !== $companyId) {
            abort(403, 'No tiene permiso para actualizar esta cuenta contable.');
        }

        $chartOfAccount->update($request->validated());

        return redirect()->route('tenant.chart-of-accounts.index')
            ->with('success', 'Cuenta contable actualizada correctamente.');
    }

    /**
     * Eliminar cuenta contable
     */
    public function destroy(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('delete', $chartOfAccount);

        $companyId = $this->getCompanyId();

        if ($chartOfAccount->company_id && $chartOfAccount->company_id !== $companyId) {
            abort(403, 'No tiene permiso para eliminar esta cuenta contable.');
        }

        if ($chartOfAccount->children()->exists()) {
            return back()->withErrors(['error' => 'No se puede eliminar una cuenta que tiene subcuentas.']);
        }

        $chartOfAccount->delete();

        return redirect()->route('tenant.chart-of-accounts.index')
            ->with('success', 'Cuenta contable eliminada correctamente.');
    }
}
