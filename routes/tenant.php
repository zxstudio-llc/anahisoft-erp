<?php

use App\Http\Controllers\Tenant\ApiKeyController;
use App\Http\Controllers\Tenant\CategoryController;
use App\Http\Controllers\Tenant\ClientController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\DocumentValidationController;
use App\Http\Controllers\Tenant\InvoiceController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\RoleController;
use App\Http\Controllers\Tenant\SaleController;
use App\Http\Controllers\Tenant\UserController;
use App\Http\Controllers\Tenant\SubscriptionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Middleware\CheckSubscription;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Tenant\SettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PasswordController;


/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/



Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Rutas de broadcasting para el tenant
    Broadcast::routes();

    // Ruta CSRF disponible para tenants
    Route::get('/sanctum/csrf-cookie', function () {
        return response()->noContent();
    })->name('tenant.sanctum.csrf-cookie');

    Route::middleware(['auth', 'verified', CheckSubscription::class])->group(function () {
        // Ruta principal - Dashboard
        Route::get('/', [DashboardController::class, 'index'])->name('tenant.dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('tenant.dashboard');

        Route::prefix('finanzas')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/finanzas/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/chart-of-accounts', fn () => Inertia::render('Tenant/Accounting/chart-of-accounts'));
            Route::get('/account-statements', fn () => Inertia::render('Tenant/Accounting/account-statements'));
            Route::get('/financial-statements', fn () => Inertia::render('Tenant/Accounting/financial-statements'));
            Route::get('/general-ledger', fn () => Inertia::render('Tenant/Accounting/general-ledger'));
            Route::get('/journal-entries', fn () => Inertia::render('Tenant/Accounting/journal-entries'));
            Route::get('/trial-balance', fn () => Inertia::render('Tenant/Accounting/trial-balance'));
        });
        
        // CRM y Ventas
        Route::prefix('crm')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/crm/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/leads', fn () => Inertia::render('Tenant/Crm/customer-list'));
            Route::get('/pipeline', fn () => Inertia::render('Tenant/Crm/sales-pipeline'));
            // Route::get('/tareas', fn () => Inertia::render('Tenant/CRM/Tareas'));
        });
        
        // Inventario y Compras
        Route::prefix('inventory')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/inventory/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/purchase-orders', fn () => Inertia::render('Tenant/Inventory/purchase-orders'));
            Route::get('/stock-movements', fn () => Inertia::render('Tenant/Inventory/stock-movements'));
            Route::get('/providers-management', fn () => Inertia::render('Tenant/Inventory/providers-management'));
            Route::get('/warehouse-management', fn () => Inertia::render('Tenant/Inventory/warehouse-management'));
            Route::get('/inventory-management', fn () => Inertia::render('Tenant/Inventory/inventory-management'));
        });
        
        Route::prefix('compras')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/compras/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/proveedores', fn () => Inertia::render('Tenant/Compras/Proveedores'));
            Route::get('/ordenes', fn () => Inertia::render('Tenant/Compras/Ordenes'));
        });
        
        // Producción
        Route::prefix('produccion')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/produccion/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/ordenes', fn () => Inertia::render('Tenant/Manufacturing/production-orders'));
            Route::get('/mrp', fn () => Inertia::render('Tenant/Manufacturing/mrp'));
            Route::get('/process-control', fn () => Inertia::render('Tenant/Manufacturing/process-control'));
            Route::get('/work-centers', fn () => Inertia::render('Tenant/Manufacturing/work-centers'));
            Route::get('/quality-control', fn () => Inertia::render('Tenant/Manufacturing/quality-control'));
        });
        
        // Recursos Humanos
        Route::prefix('rrhh')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/rrhh/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/empleados', fn () => Inertia::render('Tenant/Hr/employees'));
            Route::get('/roles', fn () => Inertia::render('Tenant/Hr/roles'));
            Route::get('/asistencia', fn () => Inertia::render('Tenant/Hr/asistencia'));
            Route::get('/kpis', fn () => Inertia::render('Tenant/Hr/kpi'));
        });
        
        // Business Intelligence (BI)
        Route::prefix('bi')->group(function () {
            Route::get('/', function () {
                $referer = request()->headers->get('referer');
            
                if ($referer && str_contains($referer, '/bi/')) {
                    return redirect(parse_url($referer, PHP_URL_PATH));
                }
            
                return redirect('/dashboard');
            });
            Route::get('/finanzas', fn () => Inertia::render('Tenant/PoweBi/Finanzas'));
            Route::get('/ventas', fn () => Inertia::render('Tenant/PoweBi/Ventas'));
            Route::get('/inventario', fn () => Inertia::render('Tenant/PoweBi/Inventario'));
            Route::get('/rrhh', fn () => Inertia::render('Tenant/PoweBi/RRHH'));
        });

        // Rutas para clientes
        Route::resource('clients', ClientController::class, ['as' => 'tenant']);

        // Rutas para categorías
        Route::resource('categories', CategoryController::class, ['as' => 'tenant']);

        // Rutas para productos
        Route::resource('products', ProductController::class, ['as' => 'tenant']);

        // Rutas para proveedores
        Route::resource('providers', \App\Http\Controllers\Tenant\ProviderController::class, ['as' => 'tenant']);

        // Rutas para compras
        Route::resource('purchases', \App\Http\Controllers\Tenant\PurchaseController::class, ['as' => 'tenant']);

        // Rutas para API Keys
        Route::resource('api-keys', ApiKeyController::class, ['only' => ['index', 'store', 'destroy']]); 
        Route::get('api-keys/docs', function () {
            return Inertia::render('Tenant/ApiKeys/ApiDocs');
        })->name('api-keys.docs');

        // Rutas para suscripciones

        Route::prefix('subscription')->name('subscription.')->group(function () {
            Route::get('/', [SubscriptionController::class, 'index'])->name('index')->withoutMiddleware(['auth', 'verified']);
            Route::get('/expired', [SubscriptionController::class, 'expired'])->name('expired')->withoutMiddleware(['auth', 'verified']);
            Route::get('/upgrade', [SubscriptionController::class, 'upgrade'])->name('upgrade')->withoutMiddleware([CheckSubscription::class]);
            Route::post('/process-payment', [SubscriptionController::class, 'processPayment'])->name('process-payment')->withoutMiddleware([CheckSubscription::class]);
        });

        // Route::middleware(['auth'])->prefix('subscription')->name('subscription.')->group(function () {
        //     Route::get('/', [App\Http\Controllers\Tenant\SubscriptionController::class, 'index'])->name('index');
        //     Route::get('/upgrade', [App\Http\Controllers\Tenant\SubscriptionController::class, 'upgrade'])->name('upgrade');
        //     Route::post('/process-payment', [App\Http\Controllers\Tenant\SubscriptionController::class, 'processPayment'])->name('process-payment');
        // });

        // Rutas para usuarios administrativos
        Route::middleware(['role:admin'])->group(function () {
            Route::resource('users', UserController::class, ['as' => 'tenant']);
            Route::resource('roles', RoleController::class, ['as' => 'tenant'])->names('roles');
        });

        // Rutas para ventas
        Route::resource('sales', SaleController::class, ['as' => 'tenant']);
        Route::prefix('sales')->name('tenant.sales.')->group(function () {
            Route::post('{sale}/generate-electronic', [SaleController::class, 'generateElectronic'])->name('generate-electronic');
            Route::get('{sale}/download-xml', [SaleController::class, 'downloadXml'])->name('download-xml');
            Route::get('{sale}/download-cdr', [SaleController::class, 'downloadCdr'])->name('download-cdr');
            Route::get('{sale}/download-pdf', [SaleController::class, 'downloadPdf'])->name('download-pdf');
        });

        // Ruta para la página de suscripción expirada (accesible sin autenticación y sin verificación de suscripción)
        // Route::get('/subscription/expired', function () {
        //     return Inertia::render('Tenant/Subscription/Expired');
        // })->name('subscription.expired')->withoutMiddleware(['auth', 'verified']);

        // Rutas para facturación
        Route::prefix('invoices')->name('tenant.invoices.')->group(function () {
            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::get('/create', [InvoiceController::class, 'create'])->name('create');
            Route::post('/', [InvoiceController::class, 'store'])->name('store');
            Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
            Route::get('/{invoice}/edit', [InvoiceController::class, 'edit'])->name('edit');
            Route::put('/{invoice}', [InvoiceController::class, 'update'])->name('update');
            Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->name('destroy');
            Route::get('/{invoice}/pdf', [InvoiceController::class, 'generatePdf'])->name('pdf');
        });

        // Configuración de facturación electrónica
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile.edit');
        Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('settings/password', [PasswordController::class, 'edit'])->name('settings.password.edit');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('settings.password.update');
        Route::post('/settings/test-sunat-connection', [SettingsController::class, 'testSunatConnection'])->name('settings.test-sunat-connection');
        Route::post('/settings/certificate-info', [SettingsController::class, 'getCertificateInfo'])->name('settings.certificate-info');
        Route::post('/settings/upload-logo', [SettingsController::class, 'uploadLogo'])->name('settings.upload-logo');
        Route::post('/settings/remove-logo', [SettingsController::class, 'removeLogo'])->name('settings.remove-logo');
        Route::get('settings/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('settings.appearance');

        // require __DIR__ . '/settings.php';
    });

    require __DIR__ . '/auth.php';
});
