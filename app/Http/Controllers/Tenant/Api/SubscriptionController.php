<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Http\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Obtener estado de la suscripción
     */
    public function getStatus()
    {
        $tenant = Tenant::current();
        $subscription = $tenant->activeSubscription();
        
        return response()->json([
            'success' => true,
            'data' => [
                'isActive' => $subscription && $subscription->isActive(),
                'onTrial' => $subscription && $subscription->onTrial(),
                'subscriptionEndsAt' => $subscription ? $subscription->ends_at : null,
                'trialEndsAt' => $subscription ? $subscription->trial_ends_at : null,
                'status' => $subscription ? $subscription->status : null,
            ],
        ]);
    }

    /**
     * Obtener planes disponibles
     */
    public function getPlans()
    {
        $plans = SubscriptionPlan::all();
        
        return response()->json([
            'success' => true,
            'plans' => $plans,
        ]);
    }

    /**
     * Actualizar suscripción
     */
    public function upgrade(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_period' => 'required|in:monthly,yearly',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $plan = SubscriptionPlan::find($request->plan_id);
        $tenant = Tenant::current();
        
        try {
            $preference = $this->paymentService->createSubscriptionPreference(
                $plan,
                $request->billing_period,
                $tenant->id
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'preference_id' => $preference['preference_id'],
                    'init_point' => $preference['init_point'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la preferencia de pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Procesar pago
     */
    public function processPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_id' => 'required|string',
            'status' => 'required|string',
            'preference_id' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $result = $this->paymentService->processPayment($request->payment_id);
            
            return response()->json([
                'success' => true,
                'message' => 'Pago procesado correctamente',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 