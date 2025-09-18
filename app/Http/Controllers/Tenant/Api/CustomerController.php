<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function all()
    {
        try {
            // Obtener todos los customers activos ordenados por fecha de creación
            $customers = Customer::where('active', true)
                ->orderBy('created_at', 'desc')
                ->get();

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
                'identification_types' => $identificationTypes,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching all customers:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al cargar los clientes'
            ], 500);
        }
    }
    
    /**
     * Listar customers
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Obtener parámetros directamente del request (sin nested params)
        $search = $request->input('search');
        $identificationType = $request->input('identification_type');
        $business_name = $request->input('business_name');
        $trade_name = $request->input('trade_name');
        $identification = $request->input('identification');
        $email = $request->input('email');
        $isActive = $request->input('active');
        $sortField = $request->input('sort_field', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Log para debug
        \Log::info('Customer index parameters:', [
            'search' => $search,
            'identification_type' => $identificationType,
            'active' => $isActive,
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
            'per_page' => $perPage,
            'page' => $page
        ]);

        // Validación de parámetros
        $validator = Validator::make([
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
            'per_page'   => $perPage,
            'page'       => $page,
        ], [
            'sort_field' => 'in:id,business_name,trade_name,identification,email,created_at',
            'sort_order' => 'in:asc,desc',
            'per_page'   => 'integer|min:1|max:100',
            'page'       => 'integer|min:1',
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

        if ($isActive !== null && $isActive !== '') {
            $query->where('active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        // Orden
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $customers = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

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
                'business_name' => $business_name ?? '',
                'trade_name' => $trade_name ?? '',
                'identification' => $identification ?? '',
                'email' => $email ?? '',
                'identification_type' => $identificationType ?? '',
                'active' => $isActive !== null && $isActive !== '' ? filter_var($isActive, FILTER_VALIDATE_BOOLEAN) : null,
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
            'identification_type' => 'required|string|in:04,05,06,07',
            'identification' => 'nullable|string|max:20|unique:customers,identification',
            'business_name' => 'required|string|max:300',
            'trade_name' => 'nullable|string|max:300',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:300',
            'district' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'ubigeo' => 'nullable|string|max:20',
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
            'identification_type' => 'required|string|size:2',
            'identification' => 'nullable|string|max:20|unique:customers,identification',
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