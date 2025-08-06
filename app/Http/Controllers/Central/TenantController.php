<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;
use App\Models\Tenant\Settings;
use App\Models\User;
use Stancl\Tenancy\Database\Models\Domain;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use App\Events\StatusTenant;
use App\Http\Services\Tenant\ValidateDocument;

class TenantController extends Controller
{
    protected ValidateDocument $validateDocument;

    public function __construct()
    {
        $this->validateDocument = new ValidateDocument();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Obtener todos los inquilinos
        $tenants = Tenant::with('subscriptionPlan')->get();
        $app_domain = config('tenancy.central_domains')[0] ?? 'localhost';

        // Preparar los datos para la vista
        $tenantsData = $tenants->map(function ($tenant) {
            // Obtener el dominio principal y contar dominios manualmente
            $domains = $tenant->domains;
            $primaryDomain = $domains->first();
            $domainsCount = $domains->count();

            // Obtener el nombre de la empresa desde la tabla settings del tenant
            $companyName = $tenant->data['company_name'] ?? null;

            // Si no existe en data, intentar obtenerlo desde la tabla settings del tenant
            if (!$companyName) {
                try {
                    $companyName = $tenant->run(function () {
                        $settings = \App\Models\Tenant\Settings::first();
                        return $settings ? $settings->company_name : null;
                    });
                } catch (\Exception $e) {
                    // Si hay un error, no hacer nada
                }
            }

            return [
                'id' => $tenant->id,
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
                'domains_count' => $domainsCount,
                'primary_domain' => $primaryDomain ? $primaryDomain->domain : null,
                'last_activity' => $this->getLastActivity($tenant->id),
                'company_name' => $companyName,
                'users_count' => $this->getTenantUsersCount($tenant->id),
                'subscription_plan' => $tenant->subscriptionPlan ? [
                    'id' => $tenant->subscriptionPlan->id,
                    'name' => $tenant->subscriptionPlan->name,
                ] : null,
                'subscription_status' => $this->getSubscriptionStatus($tenant),
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
                'is_active' => $tenant->is_active,
            ];
        });

        $stats = $this->getTenantStats();

        // Obtener planes de suscripción para el formulario de creación
        $subscriptionPlans = \App\Models\SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'price', 'invoice_limit']);

        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenantsData,
            'stats' => $stats,
            'app_domain' => $app_domain,
            'subscription_plans' => $subscriptionPlans,
        ]);
    }

    /**
     * Obtiene el estado de la suscripción del tenant
     */
    private function getSubscriptionStatus($tenant): string
    {
        if (!$tenant->is_active) {
            return 'inactive';
        }

        if ($tenant->onTrial()) {
            return 'trial';
        }

        if ($tenant->subscription_active) {
            if ($tenant->subscription_ends_at && $tenant->subscription_ends_at->isFuture()) {
                return 'active';
            }

            if ($tenant->subscription_ends_at === null) {
                return 'active';
            }
        }

        if ($tenant->subscription_ends_at && $tenant->subscription_ends_at->isPast()) {
            return 'expired';
        }

        return 'inactive';
    }

    private function getTenantStats()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Corregir la consulta para contar inquilinos con múltiples dominios
        $withMultipleDomains = DB::table('tenants')
            ->join('domains', 'tenants.id', '=', 'domains.tenant_id')
            ->select('tenants.id')
            ->groupBy('tenants.id')
            ->havingRaw('COUNT(domains.id) > 1')
            ->count();

        return [
            'total' => Tenant::count(),
            'active_last_month' => Tenant::where('created_at', '>=', $thirtyDaysAgo)->count(),
            'with_multiple_domains' => $withMultipleDomains,
            'created_this_month' => Tenant::where('created_at', '>=', $startOfMonth)->count(),
        ];
    }

    private function getLastActivity($tenantId)
    {
        // En una implementación real, esto podría venir de una tabla de actividad o logs
        return Carbon::now()->subDays(rand(0, 30))->format('Y-m-d');
    }

    private function getTenantUsersCount($tenantId)
    {
        // Usar la conexión del tenant para contar los usuarios
        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            return 0;
        }

        $count = 0;
        try {
            $count = $tenant->run(function () {
                return \App\Models\User::count();
            });
        } catch (\Exception $e) {
            // Si hay un error, devolver 0
            return 0;
        }

        return $count;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // No necesitamos un método create separado ya que usaremos un modal en el frontend
        return redirect()->route('admin.tenants.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'string', 'email', 'max:255'],
            'admin_password' => ['required', Password::defaults()],
            'ruc' => ['required', 'string', 'size:13', 'unique:tenants,data->ruc'],
            'id' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', 'unique:tenants,id'],
            'domain' => ['nullable', 'string', 'max:255', 'unique:domains,domain'],
            'subscription_plan_id' => ['nullable', 'exists:subscription_plans,id'],
            'subscription_ends_at' => ['nullable', 'date'],
        ], [
            'id.regex' => 'El ID solo puede contener letras minúsculas, números y guiones.',
            'id.unique' => 'Este ID de inquilino ya está en uso.',
            'domain.unique' => 'Este dominio ya está en uso.',
            'ruc.unique' => 'Este RUC ya está registrado en el sistema.',
            'ruc.size' => 'El RUC debe tener exactamente 13 dígitos.',
            'ruc.regex' => 'El RUC solo debe contener números.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generar ID y dominio automáticamente si no se proporcionan
            $id = $request->id;
            $domain = $request->domain;
            $defaultPlan = \App\Models\SubscriptionPlan::find(1);

            if (!$defaultPlan) {
                throw new \Exception('No se encontró el plan de suscripción predeterminado');
            }

            if (empty($id)) {
                // Convertir nombre de la empresa a un ID válido
                $baseId = $this->generateSlug($request->company_name);
                $id = $baseId;

                // Verificar si el ID ya existe y añadir un sufijo numérico si es necesario
                $counter = 1;
                while (Tenant::find($id)) {
                    $id = $baseId . '-' . $counter;
                    $counter++;
                }
            }

            if (empty($domain)) {
                $domain = $id . '.' . config('tenancy.central_domains')[0];

                // Verificar si el dominio ya existe y añadir un sufijo numérico si es necesario
                $counter = 1;
                while (Domain::where('domain', $domain)->exists()) {
                    $domain = $id . '-' . $counter . '.' . config('tenancy.central_domains')[0];
                    $counter++;
                }
            }

            // Crear el tenant (esto creará la base de datos)
            $tenant = Tenant::create([
                'id' => $id,
                'data' => [
                    'company_name' => $request->company_name,
                    'admin_email' => $request->admin_email,
                    'ruc' => $request->ruc,
                    'business_name' => $request->company_name, // Usar company_name como business_name
                    'trade_name' => $request->trade_name ?? '',
                    'status' => $request->status ?? 'ACTIVO',
                    'condition' => $request->condition ?? 'HABIDO',
                    'address' => $request->address ?? '',
                    'department' => $request->department ?? '',
                    'province' => $request->province ?? '',
                    'district' => $request->district ?? '',
                    'registration_date' => $request->registration_date ?? now()->format('Y-m-d'),
                ],
                'subscription_plan_id' => $defaultPlan->id,
                'subscription_ends_at'=> now()->addDays(4),
                'trial_ends_at' => now()->addDays(4),
                'is_active' => true,
                'subscription_active' => true,
            ]);

            // Crear el dominio para el tenant
            $tenant->domains()->create([
                'domain' => $domain,
            ]);

            // Crear la suscripción inicial en la base de datos central
            if ($tenant->subscriptionPlan) {
                \App\Models\Subscription::create([
                    'tenant_id' => $tenant->id,
                    'subscription_plan_id' => $tenant->subscription_plan_id,
                    'name' => $tenant->subscriptionPlan->name,
                    'plan_type' => 'monthly', // Por defecto
                    'ends_at' => $tenant->trial_ends_at,
                    'status' => 'active',
                    'stripe_id' => null,
                    'stripe_status' => null,
                    'stripe_price' => null,
                    'quantity' => 1,
                    'trial_ends_at' => $tenant->trial_ends_at,
                ]);
            }

            // Inicializar la base de datos del tenant para configurar roles y usuarios
            $tenant->run(function () use ($tenant, $request) {
                DB::beginTransaction();
                try {
                    // Configurar roles y permisos
                    $this->setupRolesAndPermissions();

                    // Crear usuario administrador
                    $user = User::create([
                        'name' => $request->admin_name,
                        'email' => $request->admin_email,
                        'password' => Hash::make($request->admin_password),
                        'tenant_id' => $tenant->id,
                    ]);

                    // Asignar rol de administrador
                    $user->assignRole('admin');

                    // Crear configuración de la empresa
                    \App\Models\Tenant\Settings::create([
                        'company_name' => $request->company_name,
                        'company_email' => $request->admin_email,
                        'tax_identification_number' => $request->ruc,
                        'legal_name' => $request->company_name,
                        'business_name' => $request->company_name,
                        'trade_name' => $request->trade_name ?? '',
                        'status' => $request->status ?? 'ACTIVO',
                        'condition' => $request->condition ?? 'HABIDO',
                        'address' => $request->address ?? '',
                        'department' => $request->department ?? '',
                        'province' => $request->province ?? '',
                        'district' => $request->district ?? '',
                        'registration_date' => $request->registration_date ?? now()->format('Y-m-d'),
                    ]);

                    // Inicializar el contador de uso de facturas
                    if ($tenant->subscriptionPlan) {
                        \App\Models\Tenant\InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $tenant->subscriptionPlan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            });

            // Emitir evento de cambio de estado
            $message = $tenant->is_active 
                ? ($tenant->subscription_active ? 'Su suscripción ha sido activada.' : 'Su cuenta está activa pero sin suscripción.') 
                : 'Su cuenta ha sido desactivada.';
            event(new StatusTenant($tenant->id, $tenant->is_active, $message));

            return back()->with([
                'success' => true,
                'message' => 'Inquilino creado correctamente. Se ha configurado la empresa "' . $request->company_name . '" con el dominio ' . $domain,
                'tenant' => [
                    'id' => $tenant->id,
                    'domain' => $domain,
                    'company_name' => $request->company_name,
                    'trial_ends_at' => $tenant->trial_ends_at->format('Y-m-d'),
                    'subscription_plan' => [
                        'id' => $defaultPlan->id,
                        'name' => $defaultPlan->name,
                    ],
                ]
            ]);
        } catch (\Exception $e) {
            // Si algo falla, intentar eliminar el tenant si fue creado
            if (isset($tenant)) {
                try {
                    $tenant->delete();
                } catch (\Exception $deleteException) {
                    // Ignorar errores al eliminar
                }
            }

            return response()->json([
                'message' => 'Error al crear el inquilino: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Configurar roles y permisos básicos
     */
    private function setupRolesAndPermissions()
    {
        // Crear permisos básicos
        $permissions = [
            'dashboard.view',
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',
            'role.view',
            'role.create',
            'role.edit',
            'role.delete',
            'tenant.manage',
            'sales.view',
            'sales.create',
            'sales.edit',
            'sales.delete',
            'inventory.view',
            'inventory.manage',
            'cash.manage',
            'cash.view',
            'accounting.view',
            'accounting.manage',
            'reports.view',
        ];

        // Crear permisos
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Crear roles
        $roles = [
            'admin' => 'Administrador del Sistema',
            'user' => 'Usuario Regular',
            'vendedor' => 'Vendedor',
            'cajero' => 'Cajero',
            'contador' => 'Contador',
        ];

        foreach ($roles as $roleName => $roleDescription) {
            Role::create(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Asignar permisos a roles
        $rolePermissions = [
            'admin' => $permissions, // Admin tiene todos los permisos
            'user' => [
                'dashboard.view',
                'user.view'
            ],
            'vendedor' => [
                'dashboard.view',
                'sales.view',
                'sales.create',
                'inventory.view',
            ],
            'cajero' => [
                'dashboard.view',
                'cash.view',
                'cash.manage',
                'sales.view',
            ],
            'contador' => [
                'dashboard.view',
                'accounting.view',
                'accounting.manage',
                'reports.view',
            ],
        ];

        foreach ($rolePermissions as $roleName => $rolePerms) {
            $role = Role::findByName($roleName);
            $role->givePermissionTo($rolePerms);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain,' . $request->domain . ',domain'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            DB::beginTransaction();

            // Buscar el inquilino
            $tenant = Tenant::findOrFail($id);

            // Actualizar datos del inquilino
            $tenant->data = array_merge($tenant->data ?? [], [
                'company_name' => $request->company_name,
            ]);
            $tenant->save();

            // Actualizar dominio principal
            $primaryDomain = $tenant->domains->first();
            if ($primaryDomain && $primaryDomain->domain !== $request->domain) {
                $primaryDomain->domain = $request->domain;
                $primaryDomain->save();
            } elseif (!$primaryDomain) {
                // Crear dominio si no existe
                $tenant->domains()->create([
                    'domain' => $request->domain,
                ]);
            }

            // Actualizar la configuración de la empresa en el tenant
            $tenant->run(function () use ($request) {
                $settings = Settings::first();
                if ($settings) {
                    $settings->company_name = $request->company_name;
                    $settings->save();
                } else {
                    Settings::create([
                        'company_name' => $request->company_name,
                    ]);
                }
            });

            DB::commit();
            return redirect()->back()->with('success', 'Inquilino actualizado correctamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar el inquilino: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Aquí iría la lógica para eliminar el producto

        return redirect()->route('tenant.products.index')
            ->with('success', 'Producto eliminado correctamente');
    }

    /**
     * Muestra el formulario para resetear credenciales del administrador del tenant
     */
    public function resetAdminCredentials(string $id)
    {
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return redirect()->route('admin.tenants.index')
                ->with('error', 'Inquilino no encontrado');
        }

        // Obtener el administrador del tenant (asumimos que es el usuario con rol admin)
        $adminUser = null;
        try {
            $adminUser = $tenant->run(function () {
                return User::role('admin')->first();
            });
        } catch (\Exception $e) {
            return redirect()->route('admin.tenants.index')
                ->with('error', 'Error al acceder a la base de datos del inquilino: ' . $e->getMessage());
        }

        if (!$adminUser) {
            return redirect()->route('admin.tenants.index')
                ->with('error', 'No se encontró el usuario administrador');
        }

        return Inertia::render('Central/Tenants/ResetAdminCredentials', [
            'tenant' => [
                'id' => $tenant->id,
                'company_name' => $tenant->data['company_name'] ?? 'Inquilino ' . $tenant->id,
                'domain' => $tenant->domains->first() ? $tenant->domains->first()->domain : null,
            ],
            'adminUser' => [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
            ]
        ]);
    }

    /**
     * Procesa el reseteo de credenciales del administrador
     */
    public function updateAdminCredentials(Request $request, string $id)
    {
        $tenant = Tenant::find($id);

        if (!$tenant) {
            return redirect()->route('admin.tenants.index')
                ->with('error', 'Inquilino no encontrado');
        }

        // Validar los datos
        $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            // Actualizar el usuario administrador
            $tenant->run(function () use ($request) {
                $adminUser = User::role('admin')->first();

                if ($adminUser) {
                    $adminUser->email = $request->email;
                    $adminUser->password = Hash::make($request->password);
                    $adminUser->save();
                }
            });

            return redirect()->route('admin.tenants.index')
                ->with('success', 'Credenciales del administrador actualizadas correctamente');
        } catch (\Exception $e) {
            return redirect()->route('admin.tenants.index')
                ->with('error', 'Error al actualizar las credenciales: ' . $e->getMessage());
        }
    }

    /**
     * Generar un slug a partir de un texto
     */
    private function generateSlug($text)
    {
        // Convertir a minúsculas y eliminar acentos
        $text = mb_strtolower($text, 'UTF-8');
        $text = $this->removeAccents($text);

        // Reemplazar espacios y caracteres especiales por guiones
        $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
        $text = preg_replace('/\s+/', '-', $text);
        $text = preg_replace('/-+/', '-', $text);

        // Recortar a 50 caracteres y eliminar guiones al principio y al final
        $text = substr(trim($text, '-'), 0, 50);

        return $text;
    }

    /**
     * Eliminar acentos de un texto
     */
    private function removeAccents($text)
    {
        $unwanted_array = [
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'Á' => 'A',
            'É' => 'E',
            'Í' => 'I',
            'Ó' => 'O',
            'Ú' => 'U',
            'ñ' => 'n',
            'Ñ' => 'N',
            'ü' => 'u',
            'Ü' => 'U'
        ];
        return strtr($text, $unwanted_array);
    }

    /**
     * Actualiza la suscripción de un tenant
     */
    public function updateSubscription(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'subscription_plan_id' => ['required', 'exists:subscription_plans,id'],
            'trial_ends_at' => ['nullable', 'date'],
            'subscription_active' => ['required', 'boolean'],
            'subscription_ends_at' => ['nullable', 'date'],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Obtener el plan de suscripción
            $plan = \App\Models\SubscriptionPlan::findOrFail($request->subscription_plan_id);

            // Guardar estado anterior para verificar cambios
            $oldPlanId = $tenant->subscription_plan_id;
            $oldActive = $tenant->subscription_active;

            // Actualizar datos de suscripción del tenant
            $tenant->subscription_plan_id = $plan->id;
            $tenant->trial_ends_at = $request->trial_ends_at;
            $tenant->subscription_active = $request->subscription_active;
            $tenant->subscription_ends_at = $request->subscription_ends_at ?: null;
            $tenant->is_active = $request->is_active;
            $tenant->save();

            // Actualizar o crear la suscripción en la base de datos central
            $subscription = \App\Models\Subscription::where('tenant_id', $tenant->id)
                ->latest()
                ->first();

            $subscriptionData = [
                'subscription_plan_id' => $plan->id,
                'name' => $plan->name,
                'plan_type' => 'monthly', // Por defecto
                'ends_at' => $request->subscription_ends_at ?: null,
                'status' => $request->subscription_active ? 'active' : 'inactive',
                'stripe_id' => null,
                'stripe_status' => null,
                'stripe_price' => null,
                'quantity' => 1,
                'trial_ends_at' => $request->trial_ends_at,
            ];

            if ($subscription) {
                // Si hay una suscripción existente, actualizarla
                $subscription->fill($subscriptionData);
                $subscription->save();
            } else {
                // Si no hay suscripción, crear una nueva
                $subscriptionData['tenant_id'] = $tenant->id;
                \App\Models\Subscription::create($subscriptionData);
            }

            // Actualizar el límite de facturas en el tenant
            if ($tenant->subscriptionPlan) {
                $tenant->run(function () use ($tenant) {
                    $invoiceUsage = \App\Models\Tenant\InvoiceUsage::first();
                    if ($invoiceUsage) {
                        $invoiceUsage->limit = $tenant->subscriptionPlan->invoice_limit;
                        $invoiceUsage->save();
                    } else {
                        \App\Models\Tenant\InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $tenant->subscriptionPlan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }
                });
            }

            // Emitir evento de cambio de estado
            $message = $tenant->is_active 
                ? ($tenant->subscription_active ? 'Su suscripción ha sido activada.' : 'Su cuenta está activa pero sin suscripción.') 
                : 'Su cuenta ha sido desactivada.';
            event(new StatusTenant($tenant->id, $tenant->is_active, $message));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Suscripción actualizada correctamente',
                'tenant' => [
                    'id' => $tenant->id,
                    'subscription_plan' => $tenant->subscriptionPlan ? [
                        'id' => $tenant->subscriptionPlan->id,
                        'name' => $tenant->subscriptionPlan->name,
                    ] : null,
                    'subscription_status' => $this->getSubscriptionStatus($tenant),
                    'trial_ends_at' => $tenant->trial_ends_at,
                    'subscription_ends_at' => $tenant->subscription_ends_at,
                    'is_active' => $tenant->is_active,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al actualizar la suscripción: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verifica el estado de pago de un tenant y actualiza su estado
     */
    public function checkPaymentStatus(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        try {
            // Verificar si la suscripción ha expirado
            if ($tenant->subscription_ends_at && $tenant->subscription_ends_at->isPast()) {
                // Desactivar la suscripción
                $tenant->subscription_active = false;
                $tenant->save();

                return response()->json([
                    'success' => true,
                    'message' => 'La suscripción ha expirado y ha sido desactivada',
                    'status' => 'expired',
                    'tenant' => [
                        'id' => $tenant->id,
                        'subscription_status' => $this->getSubscriptionStatus($tenant),
                    ]
                ]);
            }

            // Verificar si el periodo de prueba ha expirado
            if ($tenant->trial_ends_at && $tenant->trial_ends_at->isPast() && !$tenant->subscription_active) {
                return response()->json([
                    'success' => true,
                    'message' => 'El periodo de prueba ha expirado',
                    'status' => 'trial_expired',
                    'tenant' => [
                        'id' => $tenant->id,
                        'subscription_status' => $this->getSubscriptionStatus($tenant),
                    ]
                ]);
            }

            // Si la suscripción está activa
            if ($tenant->subscription_active) {
                return response()->json([
                    'success' => true,
                    'message' => 'La suscripción está activa',
                    'status' => 'active',
                    'tenant' => [
                        'id' => $tenant->id,
                        'subscription_status' => $this->getSubscriptionStatus($tenant),
                        'subscription_ends_at' => $tenant->subscription_ends_at ? $tenant->subscription_ends_at->format('Y-m-d') : null,
                    ]
                ]);
            }

            // Si está en periodo de prueba
            if ($tenant->onTrial()) {
                return response()->json([
                    'success' => true,
                    'message' => 'El tenant está en periodo de prueba',
                    'status' => 'trial',
                    'tenant' => [
                        'id' => $tenant->id,
                        'subscription_status' => $this->getSubscriptionStatus($tenant),
                        'trial_ends_at' => $tenant->trial_ends_at->format('Y-m-d'),
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'El tenant no tiene una suscripción activa',
                'status' => 'inactive',
                'tenant' => [
                    'id' => $tenant->id,
                    'subscription_status' => $this->getSubscriptionStatus($tenant),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el estado de pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra la página para gestionar la suscripción de un inquilino
     */
    public function showSubscription(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        // Obtener el dominio principal
        $primaryDomain = $tenant->domains->first();

        // Obtener el nombre de la empresa
        $companyName = $tenant->data['company_name'] ?? $tenant->id;

        // Obtener planes de suscripción disponibles
        $subscriptionPlans = \App\Models\SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'price', 'billing_period', 'invoice_limit']);

        // Obtener los pagos del tenant
        $payments = \App\Models\Payment::where('tenant_id', $tenant->id)
            ->with('subscriptionPlan')
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'subscription_plan' => [
                        'id' => $payment->subscriptionPlan->id,
                        'name' => $payment->subscriptionPlan->name,
                    ],
                    'amount' => $payment->amount,
                    'payment_date' => $payment->payment_date,
                    'billing_period' => $payment->billing_period,
                    'status' => $payment->status,
                ];
            });

        return Inertia::render('Central/Tenants/ManageSubscription', [
            'tenant' => [
                'id' => $tenant->id,
                'company_name' => $companyName,
                'primary_domain' => $primaryDomain ? $primaryDomain->domain : null,
                'subscription_plan' => $tenant->subscriptionPlan ? [
                    'id' => $tenant->subscriptionPlan->id,
                    'name' => $tenant->subscriptionPlan->name,
                ] : null,
                'subscription_status' => $this->getSubscriptionStatus($tenant),
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
                'subscription_active' => $tenant->subscription_active,
                'is_active' => $tenant->is_active,
            ],
            'subscriptionPlans' => $subscriptionPlans,
            'payments' => $payments,
        ]);
    }

    /**
     * Bloquea o desbloquea un inquilino
     */
    public function toggleActive(Request $request, string $id)
    {
        try {
            $tenant = Tenant::findOrFail($id);

            // Cambiar el estado de activación
            $tenant->is_active = !$tenant->is_active;
            $tenant->save();

            // Actualizar el estado de la suscripción en la base de datos central
            $subscription = \App\Models\Subscription::where('tenant_id', $tenant->id)
                ->latest()
                ->first();

            if ($subscription) {
                $subscription->status = $tenant->is_active ? 'active' : 'inactive';
                $subscription->save();
            } else if ($tenant->is_active && $tenant->subscriptionPlan) {
                // Si no existe una suscripción y el tenant está activo, crear una nueva
                \App\Models\Subscription::create([
                    'tenant_id' => $tenant->id,
                    'subscription_plan_id' => $tenant->subscription_plan_id,
                    'name' => $tenant->subscriptionPlan->name,
                    'plan_type' => 'monthly', // Por defecto
                    'status' => 'active',
                    'stripe_id' => null,
                    'stripe_status' => null,
                    'stripe_price' => null,
                    'quantity' => 1,
                    'trial_ends_at' => $tenant->trial_ends_at,
                    'ends_at' => $tenant->subscription_ends_at,
                ]);

                // Actualizar el límite de facturas en el tenant
                $tenant->run(function () use ($tenant) {
                    $invoiceUsage = \App\Models\Tenant\InvoiceUsage::first();
                    if ($invoiceUsage) {
                        $invoiceUsage->limit = $tenant->subscriptionPlan->invoice_limit;
                        $invoiceUsage->save();
                    } else {
                        \App\Models\Tenant\InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $tenant->subscriptionPlan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }
                });
            }

            // Emitir evento de cambio de estado
            $message = $tenant->is_active 
                ? ($tenant->subscription_active ? 'Su suscripción ha sido activada.' : 'Su cuenta está activa pero sin suscripción.') 
                : 'Su cuenta ha sido desactivada.';
            event(new StatusTenant($tenant->id, $tenant->is_active, $message));

            return response()->json([
                'success' => true,
                'message' => 'Estado del inquilino actualizado correctamente',
                'is_active' => $tenant->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del inquilino: ' . $e->getMessage()
            ], 500);
        }
    }
}
