<?php

namespace App\Http\Services;

use App\Models\Payment as PaymentModel;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CulqiPaymentService
{
    protected $baseUrl = 'https://api.culqi.com/v2';
    protected $privateKey;

    public function __construct()
    {
        $this->privateKey = config('services.culqi.private_key');
    }

    public function processSubscriptionPayment(array $paymentData, ?SubscriptionPlan $plan = null, ?string $tenantId = null): array
    {
        try {
            // Si es un webhook, procesarlo de manera diferente
            if (isset($paymentData['type']) && $paymentData['type'] === 'charge.succeeded') {
                return $this->processWebhookPayment($paymentData['data']);
            }

            // Validate required fields for direct payment
            $requiredFields = [
                'amount' => $paymentData['amount'] ?? null,
                'token' => $paymentData['token'] ?? null,
                'email' => $paymentData['email'] ?? null,
                'currency_code' => $paymentData['currency_code'] ?? 'PEN',
            ];

            $missingFields = array_keys(array_filter($requiredFields, fn($value) => empty($value)));

            if (!empty($missingFields)) {
                return [
                    'success' => false,
                    'message' => 'Campos requeridos faltantes: ' . implode(', ', $missingFields),
                    'missing_fields' => $missingFields
                ];
            }

            if (!$plan) {
                return [
                    'success' => false,
                    'message' => 'Plan de suscripción no encontrado'
                ];
            }

            // Create charge in Culqi
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->privateKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/charges', [
                'amount' => (int)($paymentData['amount'] * 100), // Culqi requires amount in cents
                'currency_code' => $paymentData['currency_code'],
                'email' => $paymentData['email'],
                'source_id' => $paymentData['token'],
                'description' => "Plan {$plan->name}",
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_period' => $paymentData['billing_period'],
                    'tenant_id' => $tenantId,
                ]
            ]);

            if ($response->successful()) {
                $charge = $response->json();
                return $this->createPaymentRecord($charge, $plan->id, $tenantId, $paymentData['billing_period']);
            }

            $error = $response->json();
            Log::error('Error processing Culqi payment', [
                'error' => $error,
                'payment_data' => array_merge($paymentData, ['token' => '***']),
            ]);

            return [
                'success' => false,
                'message' => $error['user_message'] ?? 'Error al procesar el pago',
            ];

        } catch (\Exception $e) {
            Log::error('Error processing Culqi payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payment_data' => array_merge($paymentData, ['token' => '***']),
            ]);

            return [
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ];
        }
    }

    protected function processWebhookPayment(array $chargeData): array
    {
        try {
            // Extraer metadata del cargo
            $metadata = $chargeData['metadata'] ?? [];
            $planId = $metadata['plan_id'] ?? null;
            $tenantId = $metadata['tenant_id'] ?? null;
            $billingPeriod = $metadata['billing_period'] ?? 'monthly';

            if (!$planId) {
                return [
                    'success' => false,
                    'message' => 'Plan ID no encontrado en el webhook'
                ];
            }

            return $this->createPaymentRecord($chargeData, $planId, $tenantId, $billingPeriod);

        } catch (\Exception $e) {
            Log::error('Error processing webhook payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'charge_data' => $chargeData
            ]);

            return [
                'success' => false,
                'message' => 'Error al procesar el pago del webhook: ' . $e->getMessage()
            ];
        }
    }

    protected function createPaymentRecord(array $charge, int $planId, ?string $tenantId, string $billingPeriod): array
    {
        // Crear registro de pago
        PaymentModel::create([
            'tenant_id' => $tenantId,
            'subscription_plan_id' => $planId,
            'payment_id' => $charge['id'],
            'amount' => $charge['amount'] / 100, // Convert back from cents
            'status' => $charge['outcome']['type'] === 'successful' ? 'approved' : 'rejected',
            'payment_method' => $charge['source']['type'],
            'billing_period' => $billingPeriod,
        ]);

        return [
            'success' => true,
            'payment_id' => $charge['id'],
            'status' => $charge['outcome']['type'] === 'successful' ? 'approved' : 'rejected',
        ];
    }

    private function calculatePrice(float $basePrice, string $billingPeriod): float
    {
        if ($billingPeriod === 'yearly') {
            $annualPrice = $basePrice * 12;
            $discount = $annualPrice * 0.15;
            return $annualPrice - $discount;
        }
        return $basePrice;
    }
} 