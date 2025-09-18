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
                'ruc' => ['required', 'string', 'size:13', 'unique:tenants,ruc'],
                'domain' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
                'plan_id' => 'required|exists:subscription_plans,id',
                'billing_period' => 'required|in:monthly,yearly',
            ]);
            
            Log::info('Validación de campos básicos completada');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error en validación de campos:', ['errors' => $e->errors()]);
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

        // ✅ SEPARAR: Campos directos de la tabla vs datos JSON
        $directFields = [
            'id' => $request->domain,
            'ruc' => $request->ruc, // ✅ Campo directo en la tabla
            'email' => $request->email, // ✅ Campo directo en la tabla  
            'trade_name' => $request->trade_name ?? $request->company_name, // ✅ Campo directo en la tabla
            'subscription_plan_id' => $request->plan_id, // ✅ Campo directo en la tabla
            'billing_period' => $request->billing_period, // ✅ Campo directo en la tabla
            'subscription_active' => true,
            'is_active' => true,
            'trial_ends_at' => $trialEndsAt, // ✅ Campo directo en la tabla
            'subscription_ends_at' => $subscriptionEndsAt, // ✅ Campo directo en la tabla
        ];

        // ✅ Datos adicionales que van en el campo JSON 'data'
        $jsonData = [
            // Información básica (referencia rápida)
            'company_name' => $request->company_name,
            'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
            'plan_price' => $plan ? $plan->price : 0,
            
            // Información completa de la empresa (datos del SRI)
            'business_name' => $request->business_name ?? $request->company_name,
            'legal_name' => $request->legal_name,
            'commercial_name' => $request->commercial_name,
            'status' => $request->status,
            'taxpayer_status' => $request->taxpayer_status ?? $request->condition,
            'head_office_address' => $request->head_office_address ?? $request->address,
            'registration_date' => $request->registration_date,
            
            // Datos estructurados del SRI
            'taxpayer_dates' => $request->taxpayer_dates ? [
                'start_date' => $request->taxpayer_dates['start_date'] ?? $request->registration_date,
            ] : ['start_date' => $request->registration_date],
            
            'establishments' => $request->establishments ? array_map(function($establishment) {
                return [
                    'address' => $establishment['address'] ?? '',
                    'department' => $establishment['department'] ?? '',
                    'province' => $establishment['province'] ?? '',
                    'district' => $establishment['district'] ?? '',
                    'parish' => $establishment['parish'] ?? '',
                ];
            }, $request->establishments) : [[
                'address' => '',
                'department' => '',
                'province' => '',
                'district' => '',
                'parish' => '',
            ]],
            
            // Información adicional del SRI
            'emission_system' => $request->emission_system,
            'accounting_system' => $request->accounting_system,
            'foreign_trade_activity' => $request->foreign_trade_activity,
            'economic_activities' => $request->economic_activities ?? [],
            'payment_vouchers' => $request->payment_vouchers ?? [],
            'electronic_systems' => $request->electronic_systems ?? [],
            'electronic_emission_date' => $request->electronic_emission_date,
            'electronic_vouchers' => $request->electronic_vouchers ?? [],
            'ple_date' => $request->ple_date,
            'registries' => $request->registries ?? [],
            'withdrawal_date' => $request->withdrawal_date,
            'profession' => $request->profession,
            'ubigeo' => $request->ubigeo,
            'capital' => $request->capital ? (float)$request->capital : 0,
            
            // Ubicación directa (para fácil acceso)
            'department' => $request->department,
            'province' => $request->province,
            'district' => $request->district,
            'parish' => $request->parish,
            
            // Campos alias para compatibilidad
            'condition' => $request->condition ?? $request->taxpayer_status,
            'address' => $request->address ?? $request->head_office_address,
        ];

        // ✅ Añadir el campo 'data' a los campos directos
        $directFields['data'] = $jsonData;

        Log::info('Creando tenant con campos separados:', [
            'campos_directos' => array_keys($directFields),
            'ruc' => $directFields['ruc'],
            'trade_name' => $directFields['trade_name'],
            'email' => $directFields['email'],
            'subscription_plan_id' => $directFields['subscription_plan_id'],
            'trial_ends_at' => $directFields['trial_ends_at'],
            'data_keys' => array_keys($jsonData)
        ]);

        // ✅ Crear tenant con la estructura correcta
        $tenant = Tenant::create($directFields);

        Log::info('Tenant creado exitosamente:', [
            'tenant_id' => $tenant->id, 
            'ruc_guardado' => $tenant->ruc,
            'trade_name_guardado' => $tenant->trade_name,
            'email_guardado' => $tenant->email,
            'subscription_plan_id_guardado' => $tenant->subscription_plan_id,
            'trial_ends_at_guardado' => $tenant->trial_ends_at,
            'billing_period_guardado' => $tenant->billing_period,
            'data_guardado' => $tenant->data ? 'SI' : 'NO'
        ]);

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

        $domainName = $request->domain . '.' . config('tenancy.central_domains')[0];
        $domain = $tenant->domains()->create(['domain' => $domainName]);

        $tenant->run(function () use ($request) {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                $adminRole = Role::create(['name' => 'admin']);
                $user->assignRole($adminRole);

                $permissions = ['view-dashboard','manage-users','manage-roles','manage-settings'];
                foreach ($permissions as $permission) {
                    Permission::create(['name' => $permission]);
                }

                $adminRole->givePermissionTo($permissions);
                session(['tenant_user_id' => $user->id]);
            });
        });

        $redirectUrl = "https://{$domain->domain}/login";

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'redirect' => $redirectUrl,
                'message' => 'Cuenta creada exitosamente',
                'tenant_data' => [
                    'id' => $tenant->id,
                    'ruc' => $tenant->ruc, // ✅ Ahora desde la columna principal
                    'trade_name' => $tenant->trade_name, // ✅ Ahora desde la columna principal
                    'email' => $tenant->email, // ✅ Ahora desde la columna principal
                    'subscription_plan_id' => $tenant->subscription_plan_id, // ✅ Ahora desde la columna principal
                    'billing_period' => $tenant->billing_period,
                    'subscription_active' => $tenant->subscription_active,
                    'trial_ends_at' => $tenant->trial_ends_at, // ✅ Ahora desde la columna principal
                    'subscription_ends_at' => $tenant->subscription_ends_at,
                    'data' => $tenant->data ?? [],
                ],
                'subscription_data' => [
                    'id' => $subscription->id,
                    'tenant_id' => $subscription->tenant_id,
                    'name' => $subscription->name,
                    'ends_at' => $subscription->ends_at,
                    'subscription_plan_id' => $subscription->subscription_plan_id,
                ],
            ]);
        }

        return redirect()->away($redirectUrl);
    }
}