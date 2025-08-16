<?php

namespace App\Http\Controllers;

use App\Http\Services\CulqiPaymentService;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(CulqiPaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function processSubscriptionPayment(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_period' => 'required|in:monthly,yearly',
            'amount' => 'required|numeric',
            'token' => 'required|string',
            'email' => 'required|email',
            'currency_code' => 'required|string|in:PEN',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $tenantId = $request->user()?->tenant_id;

        $result = $this->paymentService->processSubscriptionPayment(
            $request->all(),
            $plan,
            $tenantId
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment_id' => $result['payment_id'],
                'status' => $result['status'],
            ]
        ]);
    }

    public function success(Request $request)
    {
        try {
            if ($request->user()?->tenant_id) {
                return redirect()->route('tenant.subscription.index')->with('success', 'Pago procesado exitosamente');
            }

            return redirect()->route('register')->with('payment_success', true);

        } catch (\Exception $e) {
            Log::error('Error processing payment success', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('payment.failure');
        }
    }

    public function failure()
    {
        return Inertia::render('Tenant/Subscription/PaymentFailure', [
            'message' => session('error', 'El pago no pudo ser procesado.')
        ]);
    }

    public function pending()
    {
        return Inertia::render('Payment/Pending', [
            'message' => 'El pago está pendiente de confirmación.'
        ]);
    }

    public function webhook(Request $request)
    {
        try {
            Log::info('Payment webhook received', ['data' => $request->all()]);

            // Culqi webhooks have a different structure, we'll process them directly
            $result = $this->paymentService->processSubscriptionPayment(
                $request->all(),
                null,
                null
            );

            if (!$result['success']) {
                Log::error('Error processing webhook payment', [
                    'error' => $result['message'],
                    'data' => $request->all()
                ]);
                return response()->json(['error' => $result['message']], 422);
            }

            return response()->json(['message' => 'Payment processed successfully']);

        } catch (\Exception $e) {
            Log::error('Error in payment webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
} 