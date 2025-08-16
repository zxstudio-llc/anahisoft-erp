<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Listar usuarios
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        // Obtener parámetros desde params[] o directamente
        $params = $request->input('params', []);
        $search = $params['search'] ?? $request->input('search');
        $role = $params['role'] ?? $request->input('role');
        $isActive = isset($params['is_active']) ? filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN) : null;
        $sortField = $params['sort_field'] ?? $request->input('sort_field', 'created_at');
        $sortOrder = $params['sort_order'] ?? $request->input('sort_order', 'desc');
        $perPage = $params['per_page'] ?? $request->input('per_page', 10);
        
        // Filtros
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if (!empty($role)) {
            $query->role($role);
        }

        if ($isActive !== null) {
            $query->where('is_active', $isActive);
        }
        
        // Ordenamiento
        $query->orderBy($sortField, $sortOrder);
        
        // Paginación
        $users = $query->with('roles')->paginate($perPage)->withQueryString();
        
        // Obtener roles disponibles
        $roles = Role::all(['id', 'name'])->map(function($role) {
            return [
                'value' => $role->name,
                'label' => ucfirst($role->name)
            ];
        });
        
        return response()->json([
            'success' => true,
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role,
                'is_active' => $isActive,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => (int)$perPage,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function getStats()
    {
        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
            'with_admin_role' => User::role('admin')->count(),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }

    /**
     * Mostrar un usuario
     */
    public function show($id)
    {
        $user = User::with('roles')->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => $request->is_active ?? true,
        ]);
        
        $user->assignRole($request->role);
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente',
            'data' => $user->load('roles')
        ], 201);
    }

    /**
     * Actualizar un usuario
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);
        
        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }
        
        $user->syncRoles([$request->role]);
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente',
            'data' => $user->load('roles')
        ]);
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }
        
        // En lugar de eliminar, marcamos como inactivo
        $user->update(['is_active' => false]);
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    }
} 