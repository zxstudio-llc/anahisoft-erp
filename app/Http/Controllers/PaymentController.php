<?php

namespace App\Http\Controllers;

use App\Http\Services\PayPhonePaymentService;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PayPhonePaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Crea un payment link
     */
    public function createPaymentLink(Request $request)
    {
        try {
            $validated = $request->validate([
                'plan_id' => 'required|integer|exists:subscription_plans,id',
                'billing_period' => 'required|in:monthly,yearly',
                'amount' => 'required|numeric|min:0.01',
                'email' => 'required|email',
            ]);

            Log::info('✅ Validación exitosa', $validated);

            $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

            $result = $this->paymentService->createPaymentLink(
                $plan,
                $validated['amount'],
                $validated['email'],
                $validated['billing_period']
            );

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 422);
            }

            return response()->json([
                'success' => true,
                'payment_url' => $result['payment_url'],
                'client_transaction_id' => $result['client_transaction_id'],
                'plan_id' => $result['plan_id'],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ Error validación', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('❌ Error en createPaymentLink', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Callback de PayPhone: pago completado
     * PayPhone hace POST a esta URL cuando el pago se completa
     */
    public function paymentCallback(Request $request)
    {
        try {
            Log::info('📍 Callback de PayPhone', $request->all());

            // Aquí es donde PayPhone notifica el pago completado
            // Guarda el estado en la BD para que el frontend lo verifique
            
            $transactionId = $request->get('transactionId');
            $status = $request->get('status');
            $reference = $request->get('reference');

            if ($status === 'Approved') {
                Log::info('✅ Pago aprobado', [
                    'transaction_id' => $transactionId,
                    'reference' => $reference
                ]);
                
                // TODO: Aquí guardar el pago en tu BD
                // PaymentTransaction::create([...])
            }

            // Responder 200 OK a PayPhone
            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('❌ Error en callback', ['error' => $e->getMessage()]);
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Verifica si un pago fue completado (llamado desde el frontend)
     */
    public function checkPaymentStatus(Request $request)
    {
        try {
            $clientTransactionId = $request->get('client_transaction_id');

            Log::info('🔍 Verificando estado', ['id' => $clientTransactionId]);

            // TODO: Buscar en tu BD si el pago fue registrado
            // $payment = PaymentTransaction::where('client_transaction_id', $clientTransactionId)->first();
            
            // Por ahora retornamos false
            return response()->json([
                'success' => true,
                'is_approved' => false,
                'status' => 'pending',
                'message' => 'Pago pendiente de confirmación'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error verificando estado', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}