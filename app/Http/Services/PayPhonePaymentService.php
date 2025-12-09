<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPhonePaymentService
{
    protected string $token;
    protected string $storeId;

    public function __construct()
    {
        $this->token = env('PAYPHONE_TOKEN');
        $this->storeId = env('PAYPHONE_STORE_ID');
    }

    /**
     * Crea un Payment Link directo
     */
    public function createPaymentLink($plan, $amount, $email, $billingPeriod)
    {
        try {
            $amountCents = (int) round($amount * 100);
            $clientTransactionId = substr((date("ymd-Hi-s") . microtime(false)), 0, 15);

            $payload = [
                "amount" => $amountCents,
                "amountWithoutTax" => $amountCents,
                "amountWithTax" => 0,
                "tax" => 0,
                "currency" => "USD",
                "reference" => "Plan #{$plan->id}",
                "clientTransactionId" => $clientTransactionId,
                "storeId" => $this->storeId,
                "email" => $email,
                "expirationMinutes" => 30,
            ];

            Log::info('📤 Creando Payment Link', [
                'reference' => $plan->id,
                'amount' => $amount,
                'clientTransactionId' => $clientTransactionId
            ]);

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->token}",
                'Content-Type' => 'application/json',
            ])->post('https://pay.payphonetodoesposible.com/api/Links', $payload);

            Log::info('📥 Respuesta PayPhone', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            // PayPhone devuelve la URL directamente como string, no JSON
            $paymentUrl = trim($response->body(), '"');

            if (!$response->successful() || empty($paymentUrl) || !str_contains($paymentUrl, 'http')) {
                Log::error('❌ Error creando Payment Link', ['response' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Error al crear el link de pago.',
                ];
            }

            Log::info('✅ Payment Link creado', ['url' => $paymentUrl]);

            return [
                'success' => true,
                'payment_url' => $paymentUrl,
                'client_transaction_id' => $clientTransactionId,
                'plan_id' => $plan->id,
            ];
        } catch (\Exception $e) {
            Log::error('⚠️ Error en createPaymentLink', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verifica el estado de una transacción
     */
    public function verifyTransaction(string $clientTransactionId)
    {
        try {
            // Guardar en cache/BD el estado del pago cuando PayPhone haga callback
            // Por ahora retornamos lo que tengamos guardado
            
            Log::info('🔍 Verificando transacción', ['id' => $clientTransactionId]);

            // Nota: PayPhone no tiene un endpoint GET para verificar por clientTransactionId
            // El pago se confirma cuando PayPhone hace POST a tu callback
            
            return [
                'success' => true,
                'message' => 'Verificación pendiente',
            ];
        } catch (\Exception $e) {
            Log::error('⚠️ Error verificando transacción', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Error verificando: ' . $e->getMessage(),
            ];
        }
    }
}