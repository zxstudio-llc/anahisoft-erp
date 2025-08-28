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
            'ruc' => ['required', 'string', 'size:13', 'unique:tenants,data->ruc'],
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

    $tenantData = [
        'id' => $request->domain,
        'ruc' => $request->ruc,
        'email' => $request->email,
        'trade_name' => $request->ruc,
        'subscription_plan_id' => $request->plan_id,
        'billing_period' => $request->billing_period,
        'subscription_active' => true,
        'is_active' => true,
        'trial_ends_at' => $trialEndsAt,
        'subscription_ends_at' => $subscriptionEndsAt,
        'data' => [
            'company_name' => $request->company_name,
            'trade_name' => $request->ruc,
            'ruc' => $request->ruc,
            'email' => $request->email,
            'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
            'plan_price' => $plan ? $plan->price : 0,
            'business_name' => $request->business_name ?? $request->company_name,
            'status' => $request->status,
            'taxpayer_status' => $request->taxpayer_status ?? $request->condition,
            'head_office_address' => $request->head_office_address ?? $request->address,
            'trade_name' => $request->trade_name,
            'registration_date' => $request->registration_date,
        ],
    ];

    $tenant = Tenant::create($tenantData);

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
            'tenant_data' => array_merge([
                'id' => $tenant->id,
                'trade_name' => $tenant->ruc,
                'ruc' => $tenant->ruc,
                'email' => $tenant->email,
                'subscription_plan_id' => $tenant->subscription_plan_id,
                'billing_period' => $tenant->billing_period,
                'subscription_active' => $tenant->subscription_active,
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
            ], $tenant->data ?? []),
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
