<?php

use App\Http\Controllers\Central\DashboardController;
use App\Http\Controllers\Central\SubscriptionPlanController;
use App\Http\Controllers\Central\TenantController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SiteSettingsController;
use App\Http\Controllers\Settings\ThemesController;
use App\Http\Controllers\Settings\FooterController;
use App\Http\Controllers\Web\SeoController;
use App\Http\Controllers\Web\AnalyticsController;
use App\Http\Controllers\Web\TestimonialController;
use App\Http\Controllers\Web\MenuController;
use App\Http\Controllers\Web\BannerController;
use App\Http\Controllers\Web\MenuItemController;
use App\Http\Controllers\Web\PageController;
use App\Http\Controllers\Media\MediaController;
use App\Http\Controllers\Web\NewsController;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {

        // Ruta CSRF disponible para todos
        Route::get('sanctum/csrf-cookie', function () {
            return response()->noContent();
        })->name('sanctum.csrf-cookie');

        // your actual routes
        Route::get('/', function () {
            $plans = SubscriptionPlan::where('is_active', true)
                ->orderBy('price')
                ->get();

            return Inertia::render('welcome', [
                'plans' => $plans
            ]);
        })->name('home');

        Route::group(['prefix' => 'admin'], function () {
            // Admin login route (for superadmins, no RUC required)
            Route::middleware('guest')->group(function () {
                Route::get('login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'createAdmin'])
                    ->name('admin.login');
                Route::post('login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'storeAdmin'])
                    ->name('admin.login.store');
            });

            Route::middleware(['auth', 'verified'])->group(function () {
                Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

                // a todos lo names poner admin.
                Route::prefix('')->name('admin.')->group(function () {
                    Route::resource('tenants', TenantController::class);

                    // Rutas para resetear credenciales de administrador del tenant
                    Route::get('tenants/{tenant}/reset-admin', [TenantController::class, 'resetAdminCredentials'])->name('tenants.reset-admin');
                    Route::post('tenants/{tenant}/reset-admin', [TenantController::class, 'updateAdminCredentials'])->name('tenants.update-admin');

                    // Rutas para gestión de suscripciones de tenants
                    Route::get('/tenants/{tenant}/subscription', [TenantController::class, 'showSubscription'])->name('tenants.subscription');
                    Route::post('/tenants/{tenant}/subscription', [TenantController::class, 'updateSubscription'])->name('tenants.subscription.update');
                    Route::get('/tenants/{tenant}/check-payment', [TenantController::class, 'checkPaymentStatus'])->name('tenants.check-payment');
                    // Gestión de pagos
                    Route::resource('payments', PaymentController::class)->except(['edit', 'update', 'destroy']);
                    Route::post('/payments/{payment}/update-status', [PaymentController::class, 'updateStatus'])->name('payments.update-status');
                    Route::post('/tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');

                    // Rutas para planes de suscripción
                    Route::prefix('subscription-plans')->name('subscription-plans.')->group(function () {
                        Route::get('/', [SubscriptionPlanController::class, 'index'])->name('index');
                        Route::get('/create', [SubscriptionPlanController::class, 'create'])->name('create');
                        Route::post('/', [SubscriptionPlanController::class, 'store'])->name('store');
                        Route::get('/{plan}/edit', [SubscriptionPlanController::class, 'edit'])->name('edit');
                        Route::put('/{plan}', [SubscriptionPlanController::class, 'update'])->name('update');
                        Route::delete('/{plan}', [SubscriptionPlanController::class, 'destroy'])->name('destroy');
                    });
                    

                    Route::resource('seo', \App\Http\Controllers\Web\SeoController::class)->names('seo');
            
                Route::prefix('pages')->name('pages.')->group(function () {
                    Route::get('/', [PageController::class, 'index'])->name('index');
                    Route::get('/create', [PageController::class, 'create'])->name('create');
                    Route::post('/', [PageController::class, 'store'])->name('store');
                    Route::prefix('/{page}')->group(function () {
                        Route::get('/edit', [PageController::class, 'edit'])->name('edit');
                        Route::put('/', [PageController::class, 'update'])->name('update');
                        Route::delete('/', [PageController::class, 'destroy'])->name('destroy');
                    });
                });
            
                Route::prefix('news')->name('news.')->group(function () {
                    Route::get('/', [NewsController::class, 'index'])->name('index');
                    Route::get('/create', [NewsController::class, 'create'])->name('create');
                    Route::post('/', [NewsController::class, 'store'])->name('store');
                    Route::prefix('/{news}')->group(function () {
                        Route::get('/edit', [NewsController::class, 'edit'])->name('edit');
                        Route::put('/', [NewsController::class, 'update'])->name('update');
                        Route::delete('/', [NewsController::class, 'destroy'])->name('destroy');
                    });
                });
            
                Route::prefix('banners')->name('banners.')->group(function () {
                    Route::get('/', [BannerController::class, 'index'])->name('index');
                    Route::get('/create', [BannerController::class, 'create'])->name('create');
                    Route::post('/', [BannerController::class, 'store'])->name('store');
                    Route::prefix('/{banners}')->group(function () {
                        Route::get('/edit', [BannerController::class, 'edit'])->name('edit');
                        Route::put('/', [BannerController::class, 'update'])->name('update');
                        Route::delete('/', [BannerController::class, 'destroy'])->name('destroy');
                    });
                });
            
                Route::prefix('menus')->name('menus.')->group(function () {
                    Route::get('/', [MenuController::class, 'index'])->name('index');
                    Route::get('/create', [MenuController::class, 'create'])->name('create');
                    Route::post('/', [MenuController::class, 'store'])->name('store');
                    Route::prefix('/{menu}')->group(function () {
                        Route::get('/', [MenuController::class, 'show'])->name('show');
                        Route::get('/edit', [MenuController::class, 'edit'])->name('edit');
                        Route::put('/', [MenuController::class, 'update'])->name('update');
                        Route::delete('/', [MenuController::class, 'destroy'])->name('destroy');
                        Route::put('/update-order', [MenuController::class, 'updateOrder'])->name('update-order');
                    });
                });
            
                Route::prefix('media')->name('media.')->group(function () {
                    Route::get('/', [MediaController::class, 'index'])->name('index');
                    Route::post('/', [MediaController::class, 'store'])->name('store');
                    Route::put('/{media}', [MediaController::class, 'update'])->name('update');
                    Route::delete('/{media}', [MediaController::class, 'destroy'])->name('destroy');
                    Route::post('/{media}/restore', [MediaController::class, 'restore'])->name('restore');
                    Route::delete('/{media}/force-delete', [MediaController::class, 'forceDelete'])->name('forceDelete');
                });
            
                Route::prefix('menus')->name('menu-items.')->group(function () {
                    Route::prefix('/{menu}')->group(function () {
                        Route::get('/items', [MenuItemController::class, 'index'])->name('index');
                        Route::post('/items', [MenuItemController::class, 'store'])->name('store');
                        Route::post('/add-pages', [MenuItemController::class, 'addPage'])->name('add-pages');
                        Route::post('/add-categories', [MenuItemController::class, 'addCategory'])->name('add-categories');
                        Route::post('/items/batch', [MenuItemController::class, 'storeBatch']);
                        Route::patch('/items/batch', [MenuItemController::class, 'updateBatch']);
                    });
                });
            
                Route::prefix('menu-items')->name('menu-items.')->group(function () {
                    Route::match(['put', 'patch'], '/{menuItem}', [MenuItemController::class, 'update'])->name('update');
                    Route::delete('/{menuItem}', [MenuItemController::class, 'destroy'])->name('destroy');
                });
                
                Route::resource('testimonials', \App\Http\Controllers\Web\TestimonialController::class);
                Route::patch('/testimonials/{testimonial}/toggle', [TestimonialController::class, 'toggle'])->name('testimonials.toggle');
            
                Route::prefix('analytics')->name('analytics.')->group(function () {
                    Route::get('/', [AnalyticsController::class, 'index'])->name('index');
                    Route::put('/seo-report', [AnalyticsController::class, 'seoReport'])->name('seo-report');
                });
            
                Route::prefix('themes')->name('themes.')->group(function () {
                    Route::get('/', [ThemesController::class, 'index'])->name('index');
                    Route::get('/create', [ThemesController::class, 'create'])->name('create');
                    Route::post('/', [ThemesController::class, 'store'])->name('store');
                    Route::get('/{theme}/edit', [ThemesController::class, 'edit'])->name('edit');
                    Route::put('/{theme}', [ThemesController::class, 'update'])->name('update');
                    Route::post('/{theme}/activate', [ThemesController::class, 'activate'])->name('activate');
                });
            
                Route::prefix('footers')->name('footers.')->group(function () {
                    Route::get('/manage', [FooterController::class, 'index'])->name('manage');
                    Route::post('/{footer}', [FooterController::class, 'update'])->name('update');
                    
                    Route::post('/{footer}/activate', [FooterController::class, 'activate'])->name('activate');
                    Route::post('/{footer}/upload-logo', [FooterController::class, 'uploadLogo'])->name('upload-logo');
                    Route::post('/{footer}/upload-brand', [FooterController::class, 'uploadBrand'])->name('upload-brand');
                    Route::get('/{menu}/items', [FooterController::class, 'getMenuItems'])->name('items');
                    Route::post('/reorder', [FooterController::class, 'reorderMenuItems'])->name('reorder');
                    Route::put('/{menuItem}/toggle', [FooterController::class, 'toggleMenuItem'])->name('toggle');
                });


                    Route::prefix('settings')->name('settings.')->group(function () {
                        Route::get('/', [SiteSettingsController::class, 'edit'])->name('edit');
                        Route::post('/', [SiteSettingsController::class, 'update'])->name('update');
                        // Route::redirect('', '/profile');
                        
                        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
                        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
                        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

                        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
                        Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

                        Route::get('/appearance', function () {
                            return Inertia::render('settings/appearance');
                        })->name('appearance');
                    });
                });
            });
        });

        Route::middleware('guest')->group(function () {
            Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');
            Route::get('/registration/validate/{tenantId}', [RegisteredUserController::class, 'validateRegistration'])
                ->name('registration.validate');

            Route::post('register', [RegisteredUserController::class, 'store']);

            Route::get('register/payment', [RegisteredUserController::class, 'showPayment'])
                ->name('register.payment');

            Route::post('register/payment', [RegisteredUserController::class, 'processPayment'])
                ->name('register.payment.process');
        });

        // Rutas de pago
        Route::prefix('payment')->name('payment.')->group(function () {
            // Route::post('create-preference', [PaymentController::class, 'createPreference'])->name('create-preference');

            Route::post('create-link', [PaymentController::class, 'createPaymentLink']);
            Route::post('check-status', [PaymentController::class, 'checkPaymentStatus']);
            Route::get('callback', [PaymentController::class, 'paymentCallback']);
            Route::get('success', [PaymentController::class, 'paymentCallback'])->name('success');
        });

        // Payment routes
        // Route::post('/payment/process', [PaymentController::class, 'processSubscriptionPayment'])->name('payment.process');
        // Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');
        // Route::get('/payment/failure', [PaymentController::class, 'failure'])->name('payment.failure');
        // Route::post('/payment/webhook', [PaymentController::class, 'webhook'])->name('payment.webhook');

        

        require __DIR__ . '/auth.php';
    });
}

// Ruta para el comando de verificación de suscripciones expiradas
Route::get('/run-subscription-check', function () {
    // Verificar si la solicitud viene de un usuario autenticado o de un cron job con token
    if (Auth::check() || request()->header('X-Cron-Token') === config('app.cron_token')) {
        Artisan::call('subscriptions:check-expirations');
        return response()->json([
            'success' => true,
            'message' => 'Verificación de suscripciones completada',
            'output' => Artisan::output()
        ]);
    }

    return response()->json(['error' => 'No autorizado'], 403);
});

// Incluir rutas de test solo en desarrollo
if (config('app.env') !== 'production') {
    require __DIR__ . '/test.php';
}
