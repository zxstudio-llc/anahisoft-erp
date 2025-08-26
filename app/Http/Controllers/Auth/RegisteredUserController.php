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
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
        'company_name' => 'required|string|max:255',
        'ruc' => ['required', 'string', 'size:13', 'unique:tenants,data->ruc'],
        'domain' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
        'plan_id' => 'required|exists:subscription_plans,id',
        'billing_period' => 'required|in:monthly,yearly',
    ]);

    // Validate payment fields if plan is paid
    $plan = SubscriptionPlan::find($request->plan_id);
    if ($plan && $plan->price > 0) {
        $request->validate([
            'card_number' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string',
        ]);
    }

    try {
        // Process payment if plan is paid
        $paymentSuccessful = true;
        if ($plan && $plan->price > 0) {
            // Payment processing logic would go here
            $paymentSuccessful = true; // Simulate successful payment for now
        }

        if (!$paymentSuccessful) {
            return back()->withErrors([
                'payment' => 'Error processing payment. Please try again.'
            ])->withInput();
        }

        // ✅ CORRECCION: Calcular fechas basadas en el plan
        $now = now();
        $isFreePlan = !$plan || $plan->price == 0;
        
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

        // ✅ CORRECCION: Crear el tenant con los campos correctos incluyendo RUC
        $tenant = Tenant::create([
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
                'ruc' => $request->ruc, // ✅ AGREGAR RUC AL DATA JSON
                // ✅ AGREGAR DATOS ADICIONALES DEL PLAN
                'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
                'plan_price' => $plan ? $plan->price : 0,
                // ✅ AGREGAR DATOS ADICIONALES DE SUNAT
                'business_name' => $request->business_name ?? $request->company_name,
                'status' => $request->status,
                'taxpayer_status' => $request->taxpayer_status ?? $request->condition,
                'head_office_address' => $request->head_office_address ?? $request->address,
                'trade_name' => $request->trade_name,
                'registration_date' => $request->registration_date,
            ],
        ]);

        // ✅ NUEVO: Crear el registro en la tabla subscriptions
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'name' => $plan ? $plan->name : 'Plan Gratuito',
            'stripe_id' => null, // Se asignará cuando se integre Stripe
            'stripe_status' => null, // Se asignará cuando se integre Stripe
            'stripe_price' => null, // Se asignará cuando se integre Stripe
            'quantity' => 1,
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => $subscriptionEndsAt,
            'created_at' => $now,
            'updated_at' => $now,
            'type' => $isFreePlan ? 'free' : 'paid', // O el campo que uses para identificar el tipo
            'subscription_plan_id' => $request->plan_id,
        ]);

        // Create domain for the tenant
        $domain = $tenant->domains()->create([
            'domain' => $request->domain . '.' . config('tenancy.central_domains')[0]
        ]);

        // Initialize tenant data
        $tenant->run(function () use ($request) {
            DB::transaction(function () use ($request) {
                // Create admin user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                // Assign admin role
                $adminRole = Role::create(['name' => 'admin']);
                $user->assignRole($adminRole);

                // Create permissions and assign to admin role
                $permissions = [
                    'view-dashboard',
                    'manage-users',
                    'manage-roles',
                    'manage-settings',
                ];

                foreach ($permissions as $permission) {
                    Permission::create(['name' => $permission]);
                }
                $adminRole->givePermissionTo($permissions);

                // Store user ID in session for login
                session(['tenant_user_id' => $user->id]);
            });
        });

        // ✅ OPCION 1: Redirigir al dashboard del tenant
        $dashboardUrl = "https://{$domain->domain}/dashboard";
        
        // ✅ OPCION 2: Redirigir al login del tenant (más seguro)
        $loginUrl = "https://{$domain->domain}/login";
        
        // Usar la URL de login para que el usuario pueda autenticarse en su tenant
        $redirectUrl = $loginUrl;
        
        // Si es una petición AJAX (Inertia), retornar JSON
        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'redirect' => $redirectUrl,
                'message' => 'Cuenta creada exitosamente',
                // ✅ DATOS ADICIONALES PARA DEBUG
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
        
        // Para peticiones normales, usar redirect()->away()
        return redirect()->away($redirectUrl);

    } catch (\Exception $e) {
        // Clean up if error occurs
        if (isset($tenant)) {
            $tenant->delete();
        }

        return back()->withErrors([
            'error' => 'Error creating tenant: ' . $e->getMessage()
        ])->withInput();
    }
}
}
