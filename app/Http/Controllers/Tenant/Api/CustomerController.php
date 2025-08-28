<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Listar customers
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Obtener parámetros
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $identificationType = $params['identification_type'] ?? $request->input('identification_type');
        $isActive = isset($params['active']) ? $params['active'] : $request->input('active');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);

        // Validación de parámetros
        $validator = Validator::make([
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
            'per_page'   => $perPage,
        ], [
            'sort_field' => 'in:id,business_name,trade_name,identification,email,created_at',
            'sort_order' => 'in:asc,desc',
            'per_page'   => 'integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parámetros de consulta inválidos',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Filtros
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('trade_name', 'like', "%{$search}%")
                  ->orWhere('identification', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($identificationType)) {
            $query->where('identification_type', $identificationType);
        }

        if (isset($isActive)) {
            $query->where('active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        // Orden
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $customers = $query->paginate($perPage)->withQueryString();

        // Opciones de identificación
        $identificationTypes = [
            ['value' => '04', 'label' => 'RUC'],
            ['value' => '05', 'label' => 'Cédula'],
            ['value' => '06', 'label' => 'Pasaporte'],
            ['value' => '07', 'label' => 'Consumidor Final'],
        ];

        return response()->json([
            'success' => true,
            'customers' => $customers,
            'filters' => [
                'search' => $search ?? '',
                'identification_type' => $identificationType ?? '',
                'active' => isset($isActive) ? filter_var($isActive, FILTER_VALIDATE_BOOLEAN) : null,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int) $perPage,
            ],
            'identification_types' => $identificationTypes,
        ]);
    }

    /**
     * Mostrar un customer
     */
    public function show($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Crear un nuevo customer
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|exists:companies,id',
            'identification_type' => 'required|string|size:2',
            'identification' => 'nullable|string|max:20',
            'business_name' => 'required|string|max:300',
            'trade_name' => 'nullable|string|max:300',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:300',
            'special_taxpayer' => 'boolean',
            'accounting_required' => 'boolean',
            'credit_limit' => 'numeric|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cliente creado correctamente',
            'data' => $customer
        ], 201);
    }

    /**
     * Actualizar un customer
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'company_id' => 'required|exists:companies,id',
            'identification_type' => 'required|string|size:2',
            'identification' => 'nullable|string|max:20|unique:customers,identification,' . $customer->id . ',id,company_id,' . $customer->company_id,
            'business_name' => 'required|string|max:300',
            'trade_name' => 'nullable|string|max:300',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:300',
            'special_taxpayer' => 'boolean',
            'accounting_required' => 'boolean',
            'credit_limit' => 'numeric|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cliente actualizado correctamente',
            'data' => $customer
        ]);
    }

    /**
     * Eliminar un customer (marcar como inactivo)
     */
    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $customer->update(['active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Cliente eliminado correctamente'
        ]);
    }
}
