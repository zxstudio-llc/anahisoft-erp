<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Listar roles
     */
    public function index(Request $request)
    {
        $query = Role::query();

        // Obtener parámetros de búsqueda
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'name');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'asc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);

        // Validar parámetros
        $validator = Validator::make([
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
            'per_page' => $perPage
        ], [
            'sort_field' => 'in:name,created_at,updated_at',
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
            $query->where('name', 'like', "%{$search}%");
        }

        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $roles = $query->with('permissions')->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'roles' => $roles,
            'filters' => [
                'search' => $search ?? '',
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
        ]);
    }

    /**
     * Obtener permisos disponibles
     */
    public function getPermissions()
    {
        $permissions = Permission::all(['id', 'name']);

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Mostrar un rol
     */
    public function show($id)
    {
        if (!is_numeric($id)) {
            return response()->json([
                'success' => false,
                'message' => 'ID de rol inválido'
            ], 400);
        }

        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'role' => $role
        ]);
    }

    /**
     * Crear un nuevo rol
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Rol creado correctamente',
            'role' => $role->load('permissions')
        ], 201);
    }

    /**
     * Actualizar un rol
     */
    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado correctamente',
            'role' => $role->load('permissions')
        ]);
    }

    /**
     * Eliminar un rol
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Rol no encontrado'
            ], 404);
        }

        // Verificar si hay usuarios con este rol
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el rol porque tiene usuarios asignados'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rol eliminado correctamente'
        ]);
    }
}
