<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\ChartOfAccount;
use App\Imports\ChartOfAccountsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChartOfAccountsController extends Controller
{
    public function index(Request $request)
    {
        $params = $request->input('params', []);
        $query = ChartOfAccount::query();

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
        }

        if (isset($params['active'])) {
            $query->where('active', filter_var($params['active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortField = $params['sort_field'] ?? 'code';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $query->orderBy($sortField, $sortOrder);

        // Siempre devolver todos los registros sin paginación
        $perPage = $request->input('per_page', 20);

        $accounts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'accounts' => $accounts,
        ]);
    }


    public function show($id)
    {
        $account = ChartOfAccount::with('children')->find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 404);
        }

        return response()->json(['success' => true, 'data' => $account]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:chart_of_accounts,code',
            'name' => 'required|string|max:255',
            'financial_statement_type' => 'required|string',
            'nature' => 'required|in:debit,credit,neutral',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'has_children' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $account = ChartOfAccount::create($validator->validated());

        return response()->json(['success' => true, 'data' => $account], 201);
    }

    public function update(Request $request, $id)
    {
        $account = ChartOfAccount::find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:chart_of_accounts,code,' . $account->id,
            'name' => 'required|string|max:255',
            'financial_statement_type' => 'required|string',
            'nature' => 'required|in:debit,credit,neutral',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'has_children' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $account->update($validator->validated());

        return response()->json(['success' => true, 'data' => $account]);
    }

    public function destroy($id)
    {
        $account = ChartOfAccount::find($id);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 404);
        }

        if ($account->children()->exists()) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar una cuenta que tiene subcuentas'], 400);
        }

        $account->delete();

        return response()->json(['success' => true, 'message' => 'Cuenta eliminada correctamente']);
    }

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv|max:2048',
            ]);

            Excel::import(new ChartOfAccountsImport, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Plan de cuentas importado correctamente.'
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->failures()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
