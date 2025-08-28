<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Events\StatusTenant;
use App\Http\Services\Tenant\ValidateDocument;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    protected ValidateDocument $validateDocument;

    public function __construct()
    {
        $this->validateDocument = new ValidateDocument();
    }

    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        $app_domain = config('tenancy.central_domains')[0] ?? 'localhost';

        // Obtener el plan gratuito o básico para mostrar en el formulario
        $freePlan = SubscriptionPlan::where('price', 0)->first();

        // Obtener el plan seleccionado si se proporciona
        $selectedPlan = null;
        if ($request->has('plan')) {
            $selectedPlan = SubscriptionPlan::find($request->plan);
            if ($selectedPlan) {
                $selectedPlan = [
                    'id' => $selectedPlan->id,
                    'name' => $selectedPlan->name,
                    'price' => $selectedPlan->price,
                    'features' => $selectedPlan->features,
                ];
            }
        }

        return Inertia::render('auth/register', [
            'freePlan' => $freePlan ? [
                'id' => $freePlan->id,
                'name' => $freePlan->name,
                'price' => $freePlan->price,
                'features' => $freePlan->features,
            ] : null,
            'selectedPlan' => $selectedPlan,
            'app_domain' => $app_domain,
            'billing_period' => $request->billing_period ?? 'monthly',
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
{
    Log::info('=== INICIO DEL PROCESO DE REGISTRO ===');
    Log::info('Datos recibidos:', $request->all());
    
    try {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'ruc' => ['required', 'string', 'size:13'],
            'domain' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_period' => 'required|in:monthly,yearly',
        ]);
        
        // Validar que el dominio no esté duplicado en tenants existentes
        $existingTenant = Tenant::where('id', $request->domain)->first();
        if ($existingTenant) {
            throw ValidationException::withMessages([
                'domain' => 'Ya existe una empresa registrada con este subdominio.',
            ]);
        }
        
        Log::info('Validación de campos básicos completada');
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Error en validación de campos:', ['errors' => $e->errors()]);
        throw $e;
    }

    // Validate payment fields if plan is paid
    $plan = SubscriptionPlan::find($request->plan_id);
    Log::info('Plan encontrado:', ['plan' => $plan]);
    
    if ($plan && $plan->price > 0) {
        Log::info('Plan es de pago, validando campos de tarjeta');
        try {
            $request->validate([
                'card_number' => 'required|string',
                'card_expiry' => 'required|string',
                'card_cvv' => 'required|string',
            ]);
            Log::info('Validación de campos de pago completada');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error en validación de campos de pago:', ['errors' => $e->errors()]);
            throw $e;
        }
    } else {
        Log::info('Plan es gratuito, no se requieren datos de pago');
    }

    try {
        Log::info('=== INICIANDO PROCESAMIENTO ===');
        
        // Process payment if plan is paid
        $paymentSuccessful = true;
        if ($plan && $plan->price > 0) {
            Log::info('Procesando pago para plan de pago');
            // Payment processing logic would go here
            $paymentSuccessful = true; // Simulate successful payment for now
            Log::info('Pago procesado exitosamente');
        }

        if (!$paymentSuccessful) {
            Log::error('Error en el procesamiento del pago');
            return back()->withErrors([
                'payment' => 'Error processing payment. Please try again.'
            ])->withInput();
        }

        // ✅ CORRECCION: Calcular fechas basadas en el plan
        $now = now();
        $isFreePlan = !$plan || $plan->price == 0;
        Log::info('Calculando fechas de suscripción:', [
            'isFreePlan' => $isFreePlan,
            'billing_period' => $request->billing_period
        ]);
        
        // Calcular fechas de suscripción
        if ($isFreePlan) {
            $trialEndsAt = $now->copy()->addDays(5)->endOfDay();
            $subscriptionEndsAt = $trialEndsAt->copy()->addDays(30)->endOfDay();
        } else {
            $trialEndsAt = null; // Planes pagados no tienen trial
            // Calcular cuando termina la suscripción basado en billing_period
            $subscriptionEndsAt = $request->billing_period === 'yearly' 
                ? $now->copy()->addYear() 
                : $now->copy()->addMonth();
        }
        
        Log::info('Fechas calculadas:', [
            'trial_ends_at' => $trialEndsAt,
            'subscription_ends_at' => $subscriptionEndsAt
        ]);

        // ✅ CORRECCION: Crear el tenant con los campos correctos
        Log::info('=== CREANDO TENANT ===');
        $tenantData = [
            'id' => $request->domain,
            // ✅ CAMPO CORRECTO: usar subscription_plan_id en lugar de plan_id
            'subscription_plan_id' => $request->plan_id,
            'billing_period' => $request->billing_period,
            // ✅ CAMPOS DE FECHAS CORRECTOS
            'subscription_active' => true,
            'is_active' => true,
            'trial_ends_at' => $trialEndsAt,
            'subscription_ends_at' => $subscriptionEndsAt,
            'data' => [
                'company_name' => $request->company_name,
                'email' => $request->email, // ✅ AGREGAR EMAIL PARA ACCESO AL TENANT
                // ✅ AGREGAR DATOS ADICIONALES DEL PLAN
                'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
                'plan_price' => $plan ? $plan->price : 0,
                // ✅ AGREGAR DATOS ADICIONALES DE SUNAT
                'business_name' => $request->business_name ?? $request->company_name,
                'status' => $request->status ?? '',
                'taxpayer_status' => $request->taxpayer_status ?? $request->condition ?? '',
                'head_office_address' => $request->head_office_address ?? $request->address ?? '',
                'trade_name' => $request->trade_name ?? '',
                'registration_date' => $request->registration_date ?? '',
                // ✅ AGREGAR CAMPOS DE UBICACIÓN
                'province' => $request->province ?? '',
                'department' => $request->department ?? '',
                'district' => $request->district ?? '',
                'parish' => $request->parish ?? '',
                // ✅ AGREGAR CAMPOS ADICIONALES DE SUNAT
                'emission_system' => $request->emission_system ?? '',
                'accounting_system' => $request->accounting_system ?? '',
                'foreign_trade_activity' => $request->foreign_trade_activity ?? '',
                'economic_activities' => $request->economic_activities ?? [],
                'payment_vouchers' => $request->payment_vouchers ?? [],
                'electronic_systems' => $request->electronic_systems ?? [],
                'electronic_emission_date' => $request->electronic_emission_date ?? '',
                'electronic_vouchers' => $request->electronic_vouchers ?? [],
                'ple_date' => $request->ple_date ?? '',
                'registries' => $request->registries ?? [],
                'withdrawal_date' => $request->withdrawal_date ?? '',
                'profession' => $request->profession ?? '',
                'ubigeo' => $request->ubigeo ?? '',
                'capital' => $request->capital ?? 0,
            ],
        ];
        
        Log::info('Datos del tenant a crear:', $tenantData);
        
        try {
            $tenant = Tenant::create($tenantData);
            Log::info('Tenant creado exitosamente:', ['tenant_id' => $tenant->id]);
        } catch (\Exception $e) {
            Log::error('Error al crear tenant:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        // ✅ NUEVO: Crear el registro en la tabla subscriptions
        Log::info('=== CREANDO SUSCRIPCIÓN ===');
        $subscriptionData = [
            'tenant_id' => $tenant->id,
            'name' => $plan ? $plan->name : 'Plan Gratuito',
            'stripe_id' => null, // Se asignará cuando se integre Stripe
            'stripe_status' => null, // Se asignará cuando se integre Stripe
            'stripe_price' => null, // Se asignará cuando se integre Stripe
            'plan_type' => $isFreePlan ? 'basic' : 'standard', // Usar plan_type que existe en la tabla
            'quantity' => 1,
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => $subscriptionEndsAt,
            'status' => 'active',
            'subscription_plan_id' => $request->plan_id,
        ];
        
        Log::info('Datos de suscripción a crear:', $subscriptionData);
        
        try {
            $subscription = Subscription::create($subscriptionData);
            Log::info('Suscripción creada exitosamente:', ['subscription_id' => $subscription->id]);
        } catch (\Exception $e) {
            Log::error('Error al crear suscripción:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        // Create domain for the tenant
        Log::info('=== CREANDO DOMINIO ===');
        $domainName = $request->domain . '.' . config('tenancy.central_domains')[0];
        Log::info('Creando dominio:', ['domain' => $domainName]);
        
        try {
            $domain = $tenant->domains()->create([
                'domain' => $domainName
            ]);
            Log::info('Dominio creado exitosamente:', ['domain_id' => $domain->id, 'domain' => $domain->domain]);
        } catch (\Exception $e) {
            Log::error('Error al crear dominio:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        // Initialize tenant data
        Log::info('=== INICIALIZANDO DATOS DEL TENANT ===');
        
        try {
            $tenant->run(function () use ($request) {
                Log::info('Ejecutando inicialización dentro del contexto del tenant');
                
                DB::transaction(function () use ($request) {
                    Log::info('Iniciando transacción para crear usuario admin');
                    
                    // Create admin user
                    $userData = [
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                    ];
                    
                    Log::info('Creando usuario admin:', ['name' => $userData['name'], 'email' => $userData['email']]);
                    
                    $user = User::create($userData);
                    Log::info('Usuario admin creado exitosamente:', ['user_id' => $user->id]);

                    // Assign admin role
                    Log::info('Creando rol de administrador');
                    $adminRole = Role::create(['name' => 'admin']);
                    Log::info('Rol admin creado, asignando al usuario');
                    $user->assignRole($adminRole);

                    // Create permissions and assign to admin role
                    $permissions = [
                        'view-dashboard',
                        'manage-users',
                        'manage-roles',
                        'manage-settings',
                    ];

                    Log::info('Creando permisos:', $permissions);
                    foreach ($permissions as $permission) {
                        Permission::create(['name' => $permission]);
                    }
                    $adminRole->givePermissionTo($permissions);
                    Log::info('Permisos asignados al rol admin');

                    // Store user ID in session for login
                    session(['tenant_user_id' => $user->id]);
                    Log::info('ID de usuario guardado en sesión para login automático');
                });
            });
            Log::info('Inicialización del tenant completada exitosamente');
        } catch (\Exception $e) {
            Log::error('Error en la inicialización del tenant:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        // ✅ OPCION 1: Redirigir al dashboard del tenant
        $dashboardUrl = "https://{$domain->domain}/dashboard";
        
        // ✅ OPCION 2: Redirigir al login del tenant (más seguro)
        $loginUrl = "https://{$domain->domain}/login";
        
        // Usar la URL de login para que el usuario pueda autenticarse en su tenant
        $redirectUrl = $loginUrl;
        
        Log::info('=== PREPARANDO RESPUESTA ===');
        Log::info('URL de redirección:', ['redirect_url' => $redirectUrl]);
        
        // Para peticiones Inertia, retornar con datos en props
        if ($request->header('X-Inertia')) {
            Log::info('Retornando respuesta Inertia con redirect');
            return back()->with([
                'success' => true,
                'redirect' => $redirectUrl,
                'message' => 'Cuenta creada exitosamente',
                'tenant_data' => [
                    'id' => $tenant->id,
                    'subscription_plan_id' => $tenant->subscription_plan_id,
                    'billing_period' => $tenant->billing_period,
                    'subscription_active' => $tenant->subscription_active,
                    'trial_ends_at' => $tenant->trial_ends_at,
                    'subscription_ends_at' => $tenant->subscription_ends_at,
                ],
                'subscription_data' => [
                    'id' => $subscription->id,
                    'tenant_id' => $subscription->tenant_id,
                    'name' => $subscription->name,
                    'ends_at' => $subscription->ends_at,
                    'subscription_plan_id' => $subscription->subscription_plan_id,
                ]
            ]);
        }
        
        // Para peticiones AJAX normales, retornar JSON
        if ($request->wantsJson()) {
            $responseData = [
                'success' => true,
                'redirect' => $redirectUrl,
                'message' => 'Cuenta creada exitosamente',
                'tenant_data' => [
                    'id' => $tenant->id,
                    'subscription_plan_id' => $tenant->subscription_plan_id,
                    'billing_period' => $tenant->billing_period,
                    'subscription_active' => $tenant->subscription_active,
                    'trial_ends_at' => $tenant->trial_ends_at,
                    'subscription_ends_at' => $tenant->subscription_ends_at,
                ],
                'subscription_data' => [
                    'id' => $subscription->id,
                    'tenant_id' => $subscription->tenant_id,
                    'name' => $subscription->name,
                    'ends_at' => $subscription->ends_at,
                    'subscription_plan_id' => $subscription->subscription_plan_id,
                ]
            ];
            
            Log::info('Retornando respuesta JSON:', $responseData);
            return response()->json($responseData);
        }
        
        // Para peticiones normales, usar redirect()->away()
        Log::info('Redirigiendo a:', ['url' => $redirectUrl]);
        return redirect()->away($redirectUrl);

    } catch (\Exception $e) {
        Log::error('=== ERROR GENERAL EN EL REGISTRO ===');
        Log::error('Error:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        // Clean up if error occurs
        if (isset($tenant)) {
            Log::info('Limpiando tenant creado debido al error');
            try {
                $tenant->delete();
                Log::info('Tenant eliminado exitosamente');
            } catch (\Exception $deleteError) {
                Log::error('Error al eliminar tenant:', ['error' => $deleteError->getMessage()]);
            }
        }

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cuenta: ' . $e->getMessage(),
                'errors' => ['error' => 'Error creating tenant: ' . $e->getMessage()]
            ], 422);
        }

        return back()->withErrors([
            'error' => 'Error creating tenant: ' . $e->getMessage()
        ])->withInput();
    }
}
}
