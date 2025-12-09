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
     * Validate registration status and redirect
     */
    public function validateRegistration(Request $request, $tenantId)
    {
        Log::info('🔍 Validando estado del registro', ['tenant_id' => $tenantId]);

        try {
            $tenant = Tenant::find($tenantId);
            
            if (!$tenant) {
                Log::error('❌ Tenant no encontrado', ['tenant_id' => $tenantId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant no encontrado'
                ], 404);
            }

            // Verificar si el tenant está completamente configurado
            $isReady = $this->checkTenantReadiness($tenant);
            
            if ($isReady) {
                $domain = $tenant->domains()->first();
                if ($domain) {
                    $redirectUrl = "https://{$domain->domain}/login";
                    
                    Log::info('✅ Tenant listo para redirección', [
                        'tenant_id' => $tenantId,
                        'redirect_url' => $redirectUrl
                    ]);

                    return response()->json([
                        'success' => true,
                        'ready' => true,
                        'redirect' => $redirectUrl,
                        'tenant' => [
                            'id' => $tenant->id,
                            'domain' => $domain->domain
                        ]
                    ]);
                } else {
                    Log::error('❌ Dominio no encontrado para tenant', ['tenant_id' => $tenantId]);
                    return response()->json([
                        'success' => false,
                        'ready' => false,
                        'message' => 'Dominio no configurado'
                    ]);
                }
            } else {
                Log::info('⏳ Tenant aún no está listo', ['tenant_id' => $tenantId]);
                return response()->json([
                    'success' => true,
                    'ready' => false,
                    'message' => 'El sistema aún se está configurando'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('❌ Error validando registro', [
                'tenant_id' => $tenantId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error validando el estado del registro'
            ], 500);
        }
    }

    /**
     * Check if tenant is fully ready
     */
    private function checkTenantReadiness(Tenant $tenant): bool
    {
        return $tenant->domains()->exists() && 
               $tenant->is_active && 
               $tenant->subscription_active;
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request)
{
    Log::info('=== INICIO DEL PROCESO DE REGISTRO ===');
    Log::info('Datos recibidos:', $request->all());
    
    try {
        // Validar SOLO campos requeridos
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'ruc' => ['required', 'string', 'size:13', 'unique:tenants,ruc'],
            'domain' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_period' => 'required|in:monthly,yearly',
        ]);
        
        Log::info('✅ Validación de campos completada');
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('❌ Error en validación de campos:', ['errors' => $e->errors()]);
        throw $e;
    }

    $plan = SubscriptionPlan::find($request->plan_id);
    $now = now();
    $isFreePlan = !$plan || $plan->price == 0;

    if ($isFreePlan) {
        $trialEndsAt = $now->copy()->addDays(5)->endOfDay();
        $subscriptionEndsAt = $trialEndsAt->copy()->addDays(30)->endOfDay();
    } else {
        $trialEndsAt = null;
        $subscriptionEndsAt = $request->billing_period === 'yearly'
            ? $now->copy()->addYear()
            : $now->copy()->addMonth();
    }

    // Campos directos
    $directFields = [
        'id' => $request->domain,
        'ruc' => $request->ruc,
        'email' => $request->email,
        'trade_name' => $request->trade_name ?? $request->company_name,
        'subscription_plan_id' => $request->plan_id,
        'billing_period' => $request->billing_period,
        'subscription_active' => true,
        'is_active' => true,
        'trial_ends_at' => $trialEndsAt,
        'subscription_ends_at' => $subscriptionEndsAt,
    ];

    // Datos JSON
    $jsonData = [
        'company_name' => $request->company_name,
        'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
        'plan_price' => $plan ? $plan->price : 0,
        'business_name' => $request->input('business_name', $request->company_name),
        // ... (tus otros campos JSON)
    ];

    $directFields['data'] = $jsonData;

    Log::info('📝 Creando tenant', ['domain' => $request->domain, 'ruc' => $request->ruc]);

    try {
        // 1. Crear tenant (esto crea la BD automáticamente)
        $tenant = Tenant::create($directFields);
        Log::info('✅ Tenant creado', ['tenant_id' => $tenant->id]);

        // 2. Crear suscripción
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'name' => $plan ? $plan->name : 'Plan Gratuito',
            'plan_type' => $isFreePlan ? 'basic' : 'standard',
            'quantity' => 1,
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => $subscriptionEndsAt,
            'status' => 'active',
            'subscription_plan_id' => $request->plan_id,
        ]);
        Log::info('✅ Suscripción creada', ['subscription_id' => $subscription->id]);

        // 3. Crear dominio
        $domainName = $request->domain . '.' . config('tenancy.central_domains')[0];
        $domain = $tenant->domains()->create(['domain' => $domainName]);
        Log::info('✅ Dominio creado', ['domain' => $domainName]);

        // 4. RESPONDER INMEDIATAMENTE al frontend
        $redirectUrl = "https://{$domainName}/login";
        
        Log::info('🚀 Respondiendo inmediatamente al frontend', [
            'tenant_id' => $tenant->id,
            'domain' => $domainName,
            'redirect_url' => $redirectUrl
        ]);

        // Respuesta inmediata
        $response = response()->json([
            'success' => true,
            'redirect' => $redirectUrl,
            'domain' => $domainName,
            'tenant_id' => $tenant->id,
            'message' => 'Cuenta creada exitosamente. Tu sistema se está configurando...',
        ]);

        // 5. PROCESAR EN SEGUNDO PLANO (después de enviar la respuesta)
        register_shutdown_function(function () use ($tenant, $request) {
            try {
                Log::info('🔄 Iniciando configuración en segundo plano...');
                
                // Crear usuario en el tenant
                $tenant->run(function () use ($request) {
                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                    ]);

                    $adminRole = Role::firstOrCreate(['name' => 'admin']);
                    $user->assignRole($adminRole);

                    $permissions = ['view-dashboard', 'manage-users', 'manage-roles', 'manage-settings'];
                    foreach ($permissions as $permission) {
                        Permission::firstOrCreate(['name' => $permission]);
                    }

                    $adminRole->syncPermissions($permissions);
                    
                    Log::info('✅ Usuario creado en tenant', ['user_id' => $user->id]);
                });

                Log::info('✅ Configuración en segundo plano completada');
                
            } catch (\Exception $e) {
                Log::error('❌ Error en configuración en segundo plano:', ['error' => $e->getMessage()]);
                // No importa si falla aquí, el tenant ya fue creado
            }
        });

        // Forzar el envío de la respuesta
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }

        return $response;

    } catch (\Exception $e) {
        Log::error('❌ Error durante el registro:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error creando la cuenta: ' . $e->getMessage()
        ], 500);
    }
}
}