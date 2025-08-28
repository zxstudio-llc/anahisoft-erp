<?php

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Tenant\DocumentValidationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Tenant\Api\CategoryController;
use App\Http\Controllers\Tenant\Api\ClientController;
use App\Http\Controllers\Tenant\Api\CustomerController;
use App\Http\Controllers\Tenant\Api\ProductController;
use App\Http\Controllers\Tenant\Api\InvoiceController;
use App\Http\Services\Tenant\ValidateDocument;
use App\Http\Controllers\Tenant\Api\AuthController;
use App\Http\Controllers\Tenant\Api\SaleController;
use App\Http\Controllers\Tenant\Api\UserController;
use App\Http\Controllers\Tenant\Api\RoleController;
use App\Http\Controllers\Tenant\Api\ApiKeyController;
use App\Http\Controllers\Tenant\Api\SubscriptionController;
use App\Http\Controllers\SRI\SriController;


Route::get('sris/info', [SriController::class, 'info']);
Route::post('sris/search', [SriController::class, 'search']);
Route::get('sris/{identification}', [SriController::class, 'show'])
    ->where('identification', '[0-9]{13}');

Route::middleware([
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Rutas públicas
    Route::get('/', function () {
        return response()->json([
            'name' => 'AnahiSoft API',
            'version' => '1.0.0',
            'status' => 'online'
        ]);
    });


    Route::post('/auth/login', [AuthController::class, 'login']);

    // Rutas protegidas que requieren autenticación
    Route::middleware(['web', 'auth:sanctum'])->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Rutas de autenticación
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/tokens', [AuthController::class, 'tokens']);
        Route::post('/auth/revoke', [AuthController::class, 'revokeToken']);

        // Ruta para verificar el estado de la suscripción (sin verificación de límites)
        Route::get('/subscription/status', [InvoiceController::class, 'checkSubscriptionStatus']);

        // Rutas de validación de documentos (con verificación de límites)
        Route::middleware(['check.invoice.limit'])->group(function () {
            // Rutas de validación de documentos

            Route::post('/documents/validate', [DocumentValidationController::class, 'validate']);

            // Rutas de facturas
            Route::prefix('invoices')->group(function () {
                Route::get('/usage', [InvoiceController::class, 'getUsageStatistics']);
                Route::get('/plan', [InvoiceController::class, 'getCurrentPlan']);
                Route::post('/', [InvoiceController::class, 'createInvoice']);
            });
        });

        // Rutas de categorías
        Route::apiResource('categories', CategoryController::class);

        // Rutas de clientes
        Route::apiResource('clients', ClientController::class);
        Route::apiResource('customer', CustomerController::class);

        // Rutas de productos
        Route::get('products/next-code', [ProductController::class, 'nextCode']);
        Route::apiResource('products', ProductController::class);

        // Rutas de ventas
        Route::apiResource('sales', SaleController::class);
        Route::prefix('sales')->name('api.sales.')->group(function () {
            Route::post('{sale}/generate-electronic', [SaleController::class, 'generateElectronic'])->name('generate-electronic');
            Route::get('{sale}/download-xml', [SaleController::class, 'downloadXml'])->name('download-xml');
            Route::get('{sale}/download-cdr', [SaleController::class, 'downloadCdr'])->name('download-cdr');
            Route::get('{sale}/download-pdf', [SaleController::class, 'downloadPdf'])->name('download-pdf');
            Route::post('{sale}/send-email', [SaleController::class, 'sendByEmail'])->name('send-email');
            Route::post('{sale}/whatsapp-link', [SaleController::class, 'generateWhatsAppLink'])->name('whatsapp-link');
            Route::get('{sale}/details', [SaleController::class, 'getSaleDetails'])->name('details');
        });

        // Rutas de usuarios
        Route::apiResource('users', UserController::class);
        Route::get('users/stats', [UserController::class, 'getStats']);

        // Rutas de roles
        Route::get('roles/permissions', [RoleController::class, 'getPermissions']);
        Route::apiResource('roles', RoleController::class);

        // Rutas de llaves API
        Route::apiResource('api-keys', ApiKeyController::class)->only(['index', 'store', 'destroy']);

        // Rutas de facturas
        Route::apiResource('invoices', InvoiceController::class);
        Route::put('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);

        // Rutas de suscripción
        Route::get('subscription/status', [SubscriptionController::class, 'getStatus']);
        Route::get('subscription/plans', [SubscriptionController::class, 'getPlans']);
        Route::post('subscription/upgrade', [SubscriptionController::class, 'upgrade']);
        Route::post('subscription/process-payment', [SubscriptionController::class, 'processPayment']);
    });
});

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::middleware(['throttle:6,1', 'validate.origin'])->group(function () {
            Route::get('/validate-ruc/{ruc}', function (string $ruc) {
                $validator = new ValidateDocument();
                return $validator->validate_ruc($ruc);
            })->where('ruc', '[0-9]{11}');

            // Rutas de pago API
            Route::prefix('payment')->name('api.payment.')->group(function () {
                Route::post('/create-preference', [PaymentController::class, 'createPreference'])->name('create-preference');
                Route::post('/process', [PaymentController::class, 'processSubscriptionPayment'])->name('process');
                Route::get('/success', [PaymentController::class, 'success'])->name('success');
                Route::get('/failure', [PaymentController::class, 'failure'])->name('failure');
                Route::get('/pending', [PaymentController::class, 'pending'])->name('pending');
                Route::post('/webhook', [PaymentController::class, 'webhook'])->name('webhook');
            });
        });
    });
}
