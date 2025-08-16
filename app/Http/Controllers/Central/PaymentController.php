<?php

namespace App\Http\Controllers\Central;

use App\Events\StatusTenant;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Muestra la lista de pagos de todos los inquilinos
     */
    public function index(Request $request)
    {
        // Obtener todos los pagos con sus relaciones
        $query = Payment::with(['tenant', 'subscriptionPlan']);

        // Filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('tenant', function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereJsonContains('data->company_name', $search);
            });
        }

        if ($request->filled('subscription_plan_id')) {
            $query->where('subscription_plan_id', $request->subscription_plan_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        // Ordenamiento
        $sortField = $request->input('sort_field', 'payment_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Paginación
        $perPage = $request->input('per_page', 10);
        $payments = $query->paginate($perPage)->withQueryString();

        // Obtener planes de suscripción para filtros
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name']);

        // Obtener todos los inquilinos para el formulario de pago
        $tenants = Tenant::select('id', 'data')
            ->orderBy('id')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'company_name' => $tenant->data['company_name'] ?? $tenant->id,
                ];
            });

        return Inertia::render('Central/Payments/Index', [
            'payments' => $payments,
            'tenants' => $tenants,
            'subscription_plans' => $subscriptionPlans,
            'filters' => [
                'search' => $request->search,
                'subscription_plan_id' => $request->subscription_plan_id,
                'status' => $request->status,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
            'payment_statuses' => [
                ['value' => 'completed', 'label' => 'Completado'],
                ['value' => 'pending', 'label' => 'Pendiente'],
                ['value' => 'failed', 'label' => 'Fallido'],
                ['value' => 'refunded', 'label' => 'Reembolsado'],
            ],
            'payment_methods' => [
                ['value' => 'credit_card', 'label' => 'Tarjeta de Crédito'],
                ['value' => 'bank_transfer', 'label' => 'Transferencia Bancaria'],
                ['value' => 'paypal', 'label' => 'PayPal'],
                ['value' => 'cash', 'label' => 'Efectivo'],
                ['value' => 'other', 'label' => 'Otro'],
            ],
        ]);
    }

    /**
     * Registra un nuevo pago para un inquilino
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|exists:tenants,id',
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'billing_period' => 'required|in:monthly,yearly',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Obtener el tenant y el plan
            $tenant = Tenant::findOrFail($request->tenant_id);
            $plan = SubscriptionPlan::findOrFail($request->subscription_plan_id);

            // Calcular fechas de inicio y fin de suscripción
            $subscriptionStartsAt = Carbon::parse($request->payment_date);
            $subscriptionEndsAt = null;

            if ($request->billing_period === 'monthly') {
                $subscriptionEndsAt = $subscriptionStartsAt->copy()->addMonth();
            } else {
                $subscriptionEndsAt = $subscriptionStartsAt->copy()->addYear();
            }

            // Crear el registro de pago
            $payment = Payment::create([
                'tenant_id' => $tenant->id,
                'subscription_plan_id' => $plan->id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'billing_period' => $request->billing_period,
                'subscription_starts_at' => $subscriptionStartsAt,
                'subscription_ends_at' => $subscriptionEndsAt,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            // Si el pago está completado, actualizar la suscripción del tenant
            if ($request->status === 'completed') {
                // Actualizar la suscripción del tenant
                $tenant->subscription_plan_id = $plan->id;
                $tenant->subscription_active = true;
                $tenant->subscription_ends_at = $subscriptionEndsAt;
                $tenant->is_active = true;
                $tenant->save();

                // Actualizar la suscripción en la base de datos del tenant
                $tenant->run(function () use ($tenant, $plan, $subscriptionEndsAt, $request) {
                    // Actualizar o crear la suscripción
                    $subscription = \App\Models\Tenant\Subscription::latest()->first();
                    
                    if ($subscription) {
                        $subscription->name = $plan->name;
                        $subscription->plan_type = $request->billing_period;
                        $subscription->ends_at = $subscriptionEndsAt;
                        $subscription->status = 'active';
                        $subscription->save();
                    } else {
                        \App\Models\Tenant\Subscription::create([
                            'name' => $plan->name,
                            'plan_type' => $request->billing_period,
                            'ends_at' => $subscriptionEndsAt,
                            'status' => 'active',
                        ]);
                    }

                    // Actualizar el límite de facturas
                    $invoiceUsage = \App\Models\Tenant\InvoiceUsage::first();
                    if ($invoiceUsage) {
                        $invoiceUsage->limit = $plan->invoice_limit;
                        $invoiceUsage->save();
                    } else {
                        \App\Models\Tenant\InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $plan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }
                });
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pago registrado correctamente',
                'payment' => $payment,
                'tenant' => [
                    'id' => $tenant->id,
                    'subscription_plan' => [
                        'id' => $plan->id,
                        'name' => $plan->name,
                    ],
                    'subscription_status' => $this->getSubscriptionStatus($tenant),
                    'subscription_ends_at' => $subscriptionEndsAt->format('Y-m-d'),
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra los detalles de un pago
     */
    public function show($id)
    {
        $payment = Payment::with(['tenant', 'subscriptionPlan'])->findOrFail($id);

        return Inertia::render('Central/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Actualiza el estado de un pago
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $payment = Payment::findOrFail($id);
            $oldStatus = $payment->status;

            // Actualizar el estado del pago
            $payment->status = $request->status;
            if ($request->filled('notes')) {
                $payment->notes = $request->notes;
            }
            $payment->save();

            // Si el pago pasa a estado completado, actualizar la suscripción del tenant
            if ($oldStatus !== 'completed' && $request->status === 'completed') {
                $tenant = Tenant::findOrFail($payment->tenant_id);
                $plan = SubscriptionPlan::findOrFail($payment->subscription_plan_id);

                // Actualizar la suscripción del tenant
                $tenant->subscription_plan_id = $plan->id;
                $tenant->subscription_active = true;
                $tenant->subscription_ends_at = $payment->subscription_ends_at;
                $tenant->is_active = true;
                $tenant->save();

                // Actualizar el límite de facturas en el tenant
                $tenant->run(function () use ($tenant, $plan, $payment) {
                    // Actualizar el límite de facturas
                    $invoiceUsage = \App\Models\Tenant\InvoiceUsage::first();
                    if ($invoiceUsage) {
                        $invoiceUsage->limit = $plan->invoice_limit;
                        $invoiceUsage->save();
                    } else {
                        \App\Models\Tenant\InvoiceUsage::create([
                            'total_invoices' => 0,
                            'monthly_invoices' => 0,
                            'limit' => $plan->invoice_limit,
                            'last_reset' => now(),
                        ]);
                    }

                    // Registrar el pago en la tabla de suscripciones
                    \App\Models\Tenant\Subscription::create([
                        'name' => $plan->name,
                        'plan_type' => $payment->billing_period,
                        'ends_at' => $payment->subscription_ends_at,
                        'stripe_status' => 'active',
                        'stripe_price' => $payment->amount,
                    ]);
                });
            }
            // Si el pago pasa de completado a otro estado, desactivar la suscripción
            else if ($oldStatus === 'completed' && $request->status !== 'completed') {
                $tenant = Tenant::findOrFail($payment->tenant_id);

                // Verificar si hay otros pagos completados para este tenant
                $hasOtherCompletedPayments = Payment::where('tenant_id', $tenant->id)
                    ->where('id', '!=', $payment->id)
                    ->where('status', 'completed')
                    ->where('subscription_ends_at', '>', now())
                    ->exists();

                // Si no hay otros pagos completados, desactivar la suscripción
                if (!$hasOtherCompletedPayments) {
                    $tenant->subscription_active = false;
                    $tenant->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Estado del pago actualizado correctamente',
                'payment' => $payment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del pago: ' . $e->getMessage()
            ], 500);
        }
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
}
