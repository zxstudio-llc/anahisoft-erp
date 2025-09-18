<?php

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Tenant\DocumentValidationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Tenant\Api\CategoryController;
use App\Http\Controllers\Tenant\Api\ChartOfAccountsController;
use App\Http\Controllers\Tenant\Api\CustomerController;
use App\Http\Controllers\Tenant\Api\ProductController;
use App\Http\Controllers\Tenant\Api\InvoicesController;
use App\Http\Services\Tenant\ValidateDocument;
use App\Http\Controllers\Tenant\Api\AuthController;
use App\Http\Controllers\Tenant\Api\InvoiceSaleController;
use App\Http\Controllers\Tenant\Api\UserController;
use App\Http\Controllers\Tenant\Api\RoleController;
use App\Http\Controllers\Tenant\Api\ApiKeyController;
use App\Http\Controllers\Tenant\Api\SubscriptionController;
use App\Http\Controllers\SRI\SriController;
use App\Http\Controllers\Auth\CentralLoginController;

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
        Route::get('/subscription/status', [InvoicesController::class, 'checkSubscriptionStatus']);

        // Rutas de validación de documentos (con verificación de límites)
        Route::middleware(['check.invoice.limit'])->group(function () {
            // Rutas de validación de documentos

            Route::post('/documents/validate', [DocumentValidationController::class, 'validate']);

            // Rutas de facturas
            Route::prefix('invoices')->group(function () {
                Route::get('/usage', [InvoicesController::class, 'getUsageStatistics']);
                Route::get('/plan', [InvoicesController::class, 'getCurrentPlan']);
                Route::post('/', [InvoicesController::class, 'createInvoice']);
            });
        });

        // Rutas de categorías
        Route::apiResource('categories', CategoryController::class);

        // Rutas de clientes
        Route::prefix('customer')->name('customer.')->group(function () {
            Route::get('/', [CustomerController::class, 'index'])->name('index');
            Route::get('/create', [CustomerController::class, 'create'])->name('create');
            Route::get('/all', [CustomerController::class, 'all'])->name('all');;
            Route::post('/', [CustomerController::class, 'store'])->name('store');
            Route::get('/{chartOfAccount}/edit', [CustomerController::class, 'edit'])->name('edit');
            Route::put('/{chartOfAccount}', [CustomerController::class, 'update'])->name('update');
            Route::delete('/{chartOfAccount}', [CustomerController::class, 'destroy'])->name('destroy');
        });
        Route::prefix('chart-of-accounts')->name('chart-of-accounts.')->group(function () {
            Route::get('/', [ChartOfAccountsController::class, 'index'])->name('index');
            Route::get('/create', [ChartOfAccountsController::class, 'create'])->name('create');
            Route::post('/', [ChartOfAccountsController::class, 'store'])->name('store');
            Route::get('/{chartOfAccount}/edit', [ChartOfAccountsController::class, 'edit'])->name('edit');
            Route::put('/{chartOfAccount}', [ChartOfAccountsController::class, 'update'])->name('update');
            Route::delete('/{chartOfAccount}', [ChartOfAccountsController::class, 'destroy'])->name('destroy');
            
            // Ruta específica para importación
            Route::post('/import', [ChartOfAccountsController::class, 'import'])->name('import');
        });

        // Rutas de productos
        Route::get('products/next-code', [ProductController::class, 'nextCode']);
        Route::apiResource('products', ProductController::class);

        // Rutas de ventas
        
        Route::prefix('sales')->name('api.sales.')->group(function () {
            Route::get('next-sequential', [InvoiceSaleController::class, 'getNextSequential'])->name('next-number');
            Route::post('{sale}/generate-electronic', [InvoiceSaleController::class, 'generateElectronic'])->name('generate-electronic');
            Route::get('{sale}/download-xml', [InvoiceSaleController::class, 'downloadXml'])->name('download-xml');
            Route::get('{sale}/download-cdr', [InvoiceSaleController::class, 'downloadCdr'])->name('download-cdr');
            Route::get('{sale}/download-pdf', [InvoiceSaleController::class, 'downloadPdf'])->name('download-pdf');
            Route::post('{sale}/send-email', [InvoiceSaleController::class, 'sendByEmail'])->name('send-email');
            Route::post('{sale}/whatsapp-link', [InvoiceSaleController::class, 'generateWhatsAppLink'])->name('whatsapp-link');
            Route::get('{sale}/details', [InvoiceSaleController::class, 'getSaleDetails'])->name('details');
            Route::get('next-sequential', [InvoiceSaleController::class, 'getNextSequential'])->name('next-number');
        });
        Route::apiResource('sales', InvoiceSaleController::class);

        // Rutas de usuarios
        Route::apiResource('users', UserController::class);
        Route::get('users/stats', [UserController::class, 'getStats']);

        // Rutas de roles
        Route::get('roles/permissions', [RoleController::class, 'getPermissions']);
        Route::apiResource('roles', RoleController::class);

        // Rutas de llaves API
        Route::apiResource('api-keys', ApiKeyController::class)->only(['index', 'store', 'destroy']);

        // Rutas de facturas
        Route::apiResource('invoices', InvoicesController::class);
        Route::put('invoices/{invoice}/status', [InvoicesController::class, 'updateStatus']);

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
