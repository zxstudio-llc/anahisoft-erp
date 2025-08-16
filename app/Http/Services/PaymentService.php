<?php

namespace App\Http\Services;

use App\Models\Payment as PaymentModel;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

class PaymentService
{
    protected $preferenceClient;
    protected $paymentClient;

    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
        $this->preferenceClient = new PreferenceClient();
        $this->paymentClient = new PaymentClient();
    }

    public function createSubscriptionPreference(SubscriptionPlan $plan, string $billingPeriod, ?string $tenantId = null): array
    {
        try {
            $price = $this->calculatePrice($plan->price, $billingPeriod);
            
            $preferenceData = [
                'items' => [
                    [
                        'title' => "Plan {$plan->name} - " . ucfirst($billingPeriod),
                        'quantity' => 1,
                        'currency_id' => 'PEN',
                        'unit_price' => $price,
                    ]
                ],
                'back_urls' => [
                    'success' => route('payment.success'),
                    'failure' => route('payment.failure'),
                    'pending' => route('payment.pending'),
                ],
                'auto_return' => 'approved',
                'binary_mode' => true,
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_period' => $billingPeriod,
                    'tenant_id' => $tenantId,
                ]
            ];

            $preference = $this->preferenceClient->create($preferenceData);

            return [
                'success' => true,
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
            ];

        } catch (\Exception $e) {
            Log::error('Error creating MercadoPago preference', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error al crear la preferencia de pago'
            ];
        }
    }

    public function processSubscriptionPayment(array $paymentData, SubscriptionPlan $plan, ?string $tenantId = null): array
    {
        try {
            // Validate required fields
            $requiredFields = [
                'transaction_amount' => $paymentData['amount'] ?? null,
                'token' => $paymentData['token'] ?? null,
                'payment_method_id' => $paymentData['payment_method_id'] ?? null,
                'payer.email' => $paymentData['payer_email'] ?? null,
                'payer.identification.number' => $paymentData['identification']['number'] ?? null,
            ];

            $missingFields = array_keys(array_filter($requiredFields, fn($value) => empty($value)));

            if (!empty($missingFields)) {
                return [
                    'success' => false,
                    'message' => 'Campos requeridos faltantes: ' . implode(', ', $missingFields),
                    'missing_fields' => $missingFields
                ];
            }

            $paymentRequest = [
                'transaction_amount' => (float)$paymentData['amount'],
                'token' => $paymentData['token'],
                'description' => "Plan {$plan->name}",
                'installments' => (int)($paymentData['installments'] ?? 1),
                'payment_method_id' => $paymentData['payment_method_id'],
                'issuer_id' => (int)($paymentData['issuer_id'] ?? 0),
                'payer' => [
                    'email' => $paymentData['payer_email'],
                    'identification' => [
                        'type' => $paymentData['identification']['type'] ?? 'DNI',
                        'number' => $paymentData['identification']['number']
                    ]
                ],
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_period' => $paymentData['billing_period'],
                    'tenant_id' => $tenantId,
                ]
            ];

            $payment = $this->paymentClient->create($paymentRequest);

            if ($payment->status === 'approved') {
                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'status' => $payment->status,
                ];
            }

            return [
                'success' => false,
                'message' => 'El pago no fue aprobado: ' . ($payment->status_detail ?? 'Error desconocido'),
                'status' => $payment->status,
            ];

        } catch (\Exception $e) {
            Log::error('Error processing MercadoPago payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payment_data' => array_merge($paymentData, ['token' => '***']), // Log payment data without sensitive info
            ]);

            return [
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ];
        }
    }

    public function processPayment(string $paymentId): array
    {
        try {
            $payment = $this->paymentClient->get($paymentId);

            if ($payment->status === 'approved') {
                $metadata = $payment->metadata;
                
                // Crear registro de pago
                $paymentRecord = PaymentModel::create([
                    'tenant_id' => $metadata['tenant_id'],
                    'subscription_plan_id' => $metadata['plan_id'],
                    'payment_id' => $paymentId,
                    'amount' => $payment->transaction_amount,
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method_id,
                    'billing_period' => $metadata['billing_period'],
                ]);

                return [
                    'success' => true,
                    'payment' => $paymentRecord,
                    'is_registration' => !$metadata['tenant_id'],
                ];
            }

            return [
                'success' => false,
                'message' => 'El pago no fue aprobado.',
                'status' => $payment->status,
            ];

        } catch (\Exception $e) {
            Log::error('Error processing MercadoPago payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error al procesar el pago'
            ];
        }
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