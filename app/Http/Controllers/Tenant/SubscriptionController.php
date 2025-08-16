<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\InvoiceUsage;
use App\Models\Tenant\Subscription as TenantSubscription;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Tenant as CentralTenant;
use App\Http\Services\Tenant\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Stancl\Tenancy\Database\TenantScope;

class SubscriptionController extends Controller
{
    protected InvoiceService $invoiceService;
    protected $tenant;

    /**
     * Constructor
     */
    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
        
        // Obtener el tenant actual
        $this->tenant = tenant();
        
        if (!$this->tenant) {
            throw new \Exception('No tenant context found');
        }
    }

    /**
     * Muestra la página de suscripción
     */
    public function index()
    {
        try {
            if (!$this->tenant) {
                return redirect()->route('subscription.expired');
            }

            // Obtener el tenant con su plan desde la base de datos central
            $tenantWithPlan = tenancy()->central(function () {
                return CentralTenant::with('subscriptionPlan')->find($this->tenant->id);
            });

            // Obtener el plan de suscripción actual
            $currentPlan = $tenantWithPlan->subscriptionPlan;

            // Obtener todos los planes disponibles desde la base de datos central
            $availablePlans = tenancy()->central(function () {
                return SubscriptionPlan::where('is_active', true)
                    ->orderBy('price')
                    ->get();
            });

            // Obtener el uso de facturas del tenant actual
            $invoiceUsage = InvoiceUsage::first();
            if (!$invoiceUsage) {
                $invoiceUsage = InvoiceUsage::create([
                    'total_invoices' => 0,
                    'monthly_invoices' => 0,
                    'limit' => $currentPlan ? $currentPlan->invoice_limit : 0,
                    'last_reset' => now(),
                ]);
            }

            // Obtener estadísticas de uso
            $usageStatistics = $this->invoiceService->getUsageStatistics();

            return Inertia::render('Tenant/Subscription/Index', [
                'currentPlan' => $currentPlan,
                'availablePlans' => $availablePlans,
                'subscriptionStatus' => [
                    'isActive' => $tenantWithPlan->hasActiveSubscription(),
                    'onTrial' => $tenantWithPlan->onTrial(),
                    'trialEndsAt' => $tenantWithPlan->trial_ends_at,
                    'subscriptionEndsAt' => $tenantWithPlan->subscription_ends_at,
                ],
                'invoiceUsage' => $usageStatistics
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading subscription page: ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudieron cargar los planes de suscripción. Por favor, inténtelo de nuevo.');
        }
    }

    /**
     * Muestra la página para actualizar la suscripción
     */
    public function upgrade()
    {
        try {
            if (!$this->tenant) {
                return redirect()->route('login')->with('error', 'Tenant not found');
            }

            // Obtener el tenant con su plan desde la base de datos central
            $tenantWithPlan = tenancy()->central(function () {
                return CentralTenant::with('subscriptionPlan')->find($this->tenant->id);
            });

            // Obtener el plan de suscripción actual
            $currentPlan = $tenantWithPlan->subscriptionPlan;

            // Obtener todos los planes disponibles desde la base de datos central
            $availablePlans = tenancy()->central(function () {
                return SubscriptionPlan::where('is_active', true)
                    ->orderBy('price')
                    ->get()
                    ->map(function ($plan) {
                        return [
                            'id' => $plan->id,
                            'name' => $plan->name,
                            'price' => (float)$plan->price,
                            'invoice_limit' => $plan->invoice_limit,
                            'features' => is_string($plan->features) ? json_decode($plan->features, true) : [],
                            'is_featured' => $plan->is_featured,
                            'is_active' => $plan->is_active
                        ];
                    });
            });

            // Obtener el estado de la suscripción
            $subscriptionStatus = [
                'isActive' => $tenantWithPlan->hasActiveSubscription(),
                'onTrial' => $tenantWithPlan->onTrial(),
                'trialEndsAt' => $tenantWithPlan->trial_ends_at,
                'subscriptionEndsAt' => $tenantWithPlan->subscription_ends_at,
            ];

            return Inertia::render('Tenant/Subscription/Upgrade', [
                'currentPlan' => $currentPlan,
                'availablePlans' => $availablePlans,
                'subscriptionStatus' => $subscriptionStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Tenant upgrade error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudieron cargar los planes de suscripción. Por favor, inténtelo de nuevo.');
        }
    }

    /**
     * Procesa el pago de la suscripción
     */
    public function processPayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'plan_id' => 'required|exists:subscription_plans,id',
                'payment_method' => 'required|string|in:credit_card,bank_transfer',
                'billing_period' => 'required|in:monthly,yearly',
            ]);

            if (!$this->tenant) {
                return redirect()->route('subscription.expired');
            }

            // Obtener el tenant con su plan desde la base de datos central
            $tenantWithPlan = tenancy()->central(function () {
                return CentralTenant::with('subscriptionPlan')->find($this->tenant->id);
            });

            // Obtener el plan seleccionado desde la base de datos central
            $plan = tenancy()->central(function () use ($validated) {
                return SubscriptionPlan::findOrFail($validated['plan_id']);
            });

            // Calcular el precio final basado en el período de facturación
            $finalPrice = $plan->price;
            if ($validated['billing_period'] === 'yearly') {
                $finalPrice = $finalPrice * 12 * 0.85; // 15% de descuento en planes anuales
            }

            // Simular procesamiento de pago
            $paymentSuccessful = true;

            if ($paymentSuccessful) {
                // Registrar el pago y actualizar la suscripción en la base de datos central
                tenancy()->central(function () use ($validated, $plan, $finalPrice, $tenantWithPlan) {
                    DB::beginTransaction();
                    try {
                        // Registrar el pago
                        \App\Models\Payment::create([
                            'tenant_id' => $this->tenant->id,
                            'subscription_plan_id' => $plan->id,
                            'amount' => $finalPrice,
                            'payment_method' => $validated['payment_method'],
                            'payment_date' => now(),
                            'billing_period' => $validated['billing_period'],
                            'subscription_starts_at' => now(),
                            'subscription_ends_at' => $validated['billing_period'] === 'monthly' 
                                ? now()->addMonth() 
                                : now()->addYear(),
                            'status' => 'completed'
                        ]);

                        // Actualizar la suscripción del tenant
                        $tenantWithPlan->subscription_plan_id = $plan->id;
                        $tenantWithPlan->subscription_active = true;
                        $tenantWithPlan->subscription_ends_at = $validated['billing_period'] === 'monthly' 
                            ? now()->addMonth() 
                            : now()->addYear();
                        $tenantWithPlan->save();

                        DB::commit();
                    } catch (\Exception $e) {
                        DB::rollBack();
                        throw $e;
                    }
                });

                // Actualizar el límite de facturas y registrar la suscripción en la base de datos del tenant
                DB::beginTransaction();
                try {
                    $invoiceUsage = InvoiceUsage::first();
                    if ($invoiceUsage) {
                        $invoiceUsage->updateLimit($plan->invoice_limit);
                    } else {
                        InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $plan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }

                    // Registrar la suscripción en la tabla de suscripciones del tenant
                    TenantSubscription::create([
                        'name' => $plan->name,
                        'plan_type' => $validated['billing_period'],
                        'ends_at' => $tenantWithPlan->subscription_ends_at,
                        'status' => 'active',
                    ]);

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }

                return redirect()->route('subscription.index')
                    ->with('success', 'Suscripción actualizada correctamente');
            }

            return back()->withErrors([
                'payment' => 'Hubo un problema al procesar el pago. Por favor, inténtelo de nuevo.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error processing subscription payment: ' . $e->getMessage());
            return back()->withErrors([
                'payment' => 'Hubo un error al procesar el pago. Por favor, inténtelo de nuevo más tarde.'
            ]);
        }
    }

    /**
     * Muestra la página de suscripción expirada
     */
    public function expired()
    {
        try {
            // Obtener todos los planes disponibles desde la base de datos central
            $availablePlans = tenancy()->central(function () {
                return SubscriptionPlan::where('is_active', true)
                    ->orderBy('price')
                    ->get();
            });

            return Inertia::render('Tenant/Subscription/Expired', [
                'availablePlans' => $availablePlans
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading expired subscription page: ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudieron cargar los planes de suscripción. Por favor, inténtelo de nuevo.');
        }
    }
}
