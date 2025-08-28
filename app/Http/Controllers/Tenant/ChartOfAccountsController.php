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
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv|max:2048', // Max 2MB
            ]);
    
            // Log para debugging
            \Log::info('Iniciando importación de plan de cuentas', [
                'file_name' => $request->file('file')->getClientOriginalName(),
                'file_size' => $request->file('file')->getSize(),
                'mime_type' => $request->file('file')->getMimeType(),
            ]);
    
            Excel::import(new ChartOfAccountsImport, $request->file('file'));
    
            \Log::info('Importación de plan de cuentas completada exitosamente');
    
            return redirect()->route('tenant.chart-of-accounts.index')
                             ->with('success', 'Plan de cuentas importado correctamente.');
    
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            \Log::error('Error de validación en importación:', [
                'failures' => $e->failures()
            ]);
            
            return redirect()->back()
                             ->withErrors(['file' => 'Error en la validación del archivo: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            \Log::error('Error general en importación:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                             ->withErrors(['file' => 'Error al procesar el archivo: ' . $e->getMessage()]);
        }
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
