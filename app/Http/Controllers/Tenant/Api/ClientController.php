<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
    /**
     * Listar clientes
     */
    public function index(Request $request)
    {
        $query = Client::query();

        // Obtener parámetros de búsqueda
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $documentType = $params['document_type'] ?? $request->input('document_type');
        $isActive = isset($params['is_active']) ? $params['is_active'] : $request->input('is_active');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);

        // Validar parámetros
        $validator = Validator::make([
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
            'per_page' => $perPage
        ], [
            'sort_field' => 'in:id,name,document_type,document_number,email,created_at',
            'sort_order' => 'in:asc,desc',
            'per_page' => 'integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parámetros de consulta inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Filtros
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($documentType)) {
            $query->where('document_type', $documentType);
        }

        if (isset($isActive)) {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $clients = $query->paginate($perPage)->withQueryString();

        // Datos para los filtros
        $documentTypes = [
            ['value' => '01', 'label' => 'DNI'],
            ['value' => '06', 'label' => 'RUC'],
            ['value' => '04', 'label' => 'CE'],
            ['value' => '07', 'label' => 'Pasaporte'],
        ];

        return response()->json([
            'success' => true,
            'clients' => $clients,
            'filters' => [
                'search' => $search ?? '',
                'document_type' => $documentType ?? '',
                'is_active' => isset($isActive) ? filter_var($isActive, FILTER_VALIDATE_BOOLEAN) : null,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
            'document_types' => $documentTypes,
        ]);
    }

    /**
     * Mostrar un cliente
     */
    public function show($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $client
        ]);
    }

    /**
     * Crear un nuevo cliente
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'document_type' => 'required|string|size:2',
            'document_number' => 'required|string|max:20|unique:clients,document_number',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'country' => 'nullable|string|size:2',
            'ubigeo' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $client = Client::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cliente creado correctamente',
            'data' => $client
        ], 201);
    }

    /**
     * Actualizar un cliente
     */
    public function update(Request $request, $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'document_type' => 'required|string|size:2',
            'document_number' => 'required|string|max:20|unique:clients,document_number,' . $client->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'country' => 'nullable|string|size:2',
            'ubigeo' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $client->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cliente actualizado correctamente',
            'data' => $client
        ]);
    }

    /**
     * Eliminar un cliente
     */
    public function destroy($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        // En lugar de eliminar, marcamos como inactivo
        $client->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Cliente eliminado correctamente'
        ]);
    }
}
