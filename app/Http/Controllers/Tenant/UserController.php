<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Muestra la lista de usuarios administrativos
     */
    public function index(Request $request)
    {
        // Obtener los filtros de la solicitud
        $search = $request->input('search', '');
        $role = $request->input('role', '');
        $sortField = $request->input('sort_field', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 10);

        // Construir la consulta base
        $query = User::with('roles')
            ->where('tenant_id', tenant()->id);

        // Aplicar filtros
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role) {
            $query->whereHas('roles', function($q) use ($role) {
                $q->where('name', $role);
            });
        }

        // Aplicar ordenamiento
        $query->orderBy($sortField, $sortOrder);

        // Obtener los usuarios paginados
        $users = $query->paginate($perPage)->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'created_at' => $user->created_at,
                'last_login' => $user->last_login,
                'is_active' => $user->is_active ?? true,
            ];
        });

        // Obtener todos los roles disponibles
        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        // Obtener estadísticas de usuarios
        $stats = [
            'total' => User::where('tenant_id', tenant()->id)->count(),
            'active' => User::where('tenant_id', tenant()->id)
                           ->where('is_active', true)
                           ->count(),
            'new_this_month' => User::where('tenant_id', tenant()->id)
                                   ->where('created_at', '>=', Carbon::now()->startOfMonth())
                                   ->count(),
            'with_admin_role' => User::where('tenant_id', tenant()->id)
                                    ->whereHas('roles', function($q) {
                                        $q->where('name', 'admin');
                                    })
                                    ->count(),
        ];

        return Inertia::render('Tenant/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Almacena un nuevo usuario administrativo
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,NULL,id,tenant_id,' . tenant()->id,
            'password' => ['required', Password::defaults()],
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => tenant()->id,
            'is_active' => $request->is_active ?? true,
        ]);

        $user->assignRole($request->roles);

        return redirect()->back()->with('success', 'Usuario creado correctamente');
    }

    /**
     * Actualiza un usuario administrativo
     */
    public function update(Request $request, User $user)
    {
        // Verificar que el usuario pertenece al tenant actual
        if ($user->tenant_id !== tenant()->id) {
            abort(403, 'No tienes permiso para editar este usuario');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id . ',id,tenant_id,' . tenant()->id,
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', Password::defaults()],
            ]);

            $user->password = Hash::make($request->password);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->is_active = $request->is_active ?? true;
        $user->save();

        $user->syncRoles($request->roles);

        return redirect()->back()->with('success', 'Usuario actualizado correctamente');
    }

    /**
     * Elimina un usuario administrativo
     */
    public function destroy(User $user)
    {
        // Verificar que el usuario pertenece al tenant actual
        if ($user->tenant_id !== tenant()->id) {
            abort(403, 'No tienes permiso para eliminar este usuario');
        }

        // Verificar que no sea el último administrador
        if ($user->hasRole('admin') && User::role('admin')->where('tenant_id', tenant()->id)->count() === 1) {
            return redirect()->back()->with('error', 'No se puede eliminar el último usuario administrador');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado correctamente');
    }

    /**
     * Muestra los detalles de un usuario
     */
    public function show(User $user)
    {
        // Verificar que el usuario pertenece al tenant actual
        if ($user->tenant_id !== tenant()->id) {
            abort(403, 'No tienes permiso para ver este usuario');
        }

        return Inertia::render('Tenant/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'created_at' => $user->created_at,
                'last_login' => $user->last_login,
                'is_active' => $user->is_active ?? true,
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
} 