<?php

namespace App\Http\Controllers\Tenant\Api;
    
use App\Http\Controllers\Controller;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\JournalEntryLine;
use App\Models\Tenant\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
    
class JournalEntryController extends Controller
{
    public function index(Request $request)
    {
        $params = $request->input('params', []);
        $query = JournalEntry::with(['lines.account']);

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where('reference', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%");
        }

        if (!empty($params['date_from'])) {
            $query->where('entry_date', '>=', $params['date_from']);
        }

        if (!empty($params['date_to'])) {
            $query->where('entry_date', '<=', $params['date_to']);
        }

        if (!empty($params['module'])) {
            $query->where('module', $params['module']);
        }

        $sortField = $params['sort_field'] ?? 'entry_date';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        $perPage = $request->input('per_page', 20);
        $entries = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'entries' => $entries,
        ]);
    }

    public function show($id)
    {
        $entry = JournalEntry::with(['lines.account'])->find($id);

        if (!$entry) {
            return response()->json(['success' => false, 'message' => 'Asiento no encontrado'], 404);
        }

        return response()->json(['success' => true, 'data' => $entry]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'module' => 'nullable|string|max:50',
            'module_id' => 'nullable|integer',
            'description' => 'required|string|max:255',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.description' => 'required|string|max:255',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
        ]);

        // Validación personalizada: cada línea debe tener débito o crédito pero no ambos
        $validator->after(function ($validator) use ($request) {
            $lines = $request->input('lines', []);
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($lines as $index => $line) {
                $debit = floatval($line['debit'] ?? 0);
                $credit = floatval($line['credit'] ?? 0);

                // Una línea debe tener débito o crédito, pero no ambos
                if (($debit > 0 && $credit > 0) || ($debit == 0 && $credit == 0)) {
                    $validator->errors()->add(
                        "lines.{$index}", 
                        'Cada línea debe tener un monto en débito o crédito, pero no en ambos.'
                    );
                }

                $totalDebit += $debit;
                $totalCredit += $credit;
            }

            // Los totales de débito y crédito deben ser iguales
            if (abs($totalDebit - $totalCredit) > 0.01) {
                $validator->errors()->add('lines', 'Los totales de débito y crédito deben ser iguales.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        
        try {
            $lines = $request->input('lines');
            $totalDebit = array_sum(array_column($lines, 'debit'));
            $totalCredit = array_sum(array_column($lines, 'credit'));

            // Crear el asiento
            $entry = JournalEntry::create([
                'entry_date' => $request->entry_date,
                'reference' => $request->reference,
                'module' => $request->module ?? 'manual',
                'module_id' => $request->module_id,
                'description' => $request->description,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
            ]);

            // Crear las líneas del asiento
            foreach ($lines as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $line['account_id'],
                    'description' => $line['description'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                ]);
            }

            DB::commit();

            $entry->load(['lines.account']);

            return response()->json(['success' => true, 'data' => $entry], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Error al crear el asiento: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $entry = JournalEntry::find($id);

        if (!$entry) {
            return response()->json(['success' => false, 'message' => 'Asiento no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'description' => 'required|string|max:255',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.description' => 'required|string|max:255',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
        ]);

        // Validación personalizada
        $validator->after(function ($validator) use ($request) {
            $lines = $request->input('lines', []);
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($lines as $index => $line) {
                $debit = floatval($line['debit'] ?? 0);
                $credit = floatval($line['credit'] ?? 0);

                if (($debit > 0 && $credit > 0) || ($debit == 0 && $credit == 0)) {
                    $validator->errors()->add(
                        "lines.{$index}", 
                        'Cada línea debe tener un monto en débito o crédito, pero no en ambos.'
                    );
                }

                $totalDebit += $debit;
                $totalCredit += $credit;
            }

            if (abs($totalDebit - $totalCredit) > 0.01) {
                $validator->errors()->add('lines', 'Los totales de débito y crédito deben ser iguales.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        
        try {
            $lines = $request->input('lines');
            $totalDebit = array_sum(array_column($lines, 'debit'));
            $totalCredit = array_sum(array_column($lines, 'credit'));

            // Actualizar el asiento
            $entry->update([
                'entry_date' => $request->entry_date,
                'reference' => $request->reference,
                'description' => $request->description,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
            ]);

            // Eliminar líneas existentes
            $entry->lines()->delete();

            // Crear nuevas líneas
            foreach ($lines as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $line['account_id'],
                    'description' => $line['description'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                ]);
            }

            DB::commit();

            $entry->load(['lines.account']);

            return response()->json(['success' => true, 'data' => $entry]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Error al actualizar el asiento: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $entry = JournalEntry::find($id);

        if (!$entry) {
            return response()->json(['success' => false, 'message' => 'Asiento no encontrado'], 404);
        }

        DB::beginTransaction();
        
        try {
            // Eliminar líneas del asiento
            $entry->lines()->delete();
            
            // Eliminar el asiento
            $entry->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Asiento eliminado correctamente']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Error al eliminar el asiento: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts()
    {
        $accounts = ChartOfAccount::where('active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'nature']);

        return response()->json([
            'success' => true,
            'accounts' => $accounts
        ]);
    }
}