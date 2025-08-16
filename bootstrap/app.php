<?php

use App\Exceptions\TenantNotFound;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CheckSubscription;
use App\Http\Middleware\CheckInvoiceLimit;
use App\Http\Middleware\CheckTokenExpiration;
use App\Http\Middleware\DualAuth;
use App\Http\Middleware\ValidateRequestOrigin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedOnDomainException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        apiPrefix: 'v1',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            CheckSubscription::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'check.subscription' => CheckSubscription::class,
            'check.invoice.limit' => CheckInvoiceLimit::class,
            'validate.origin' => ValidateRequestOrigin::class,
            'dual.auth' => DualAuth::class,
        ]);

        $middleware->api(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Maneja la excepción específica de Stancl Tenancy
        $exceptions->renderable(function (TenantCouldNotBeIdentifiedOnDomainException $e) {
            throw new TenantNotFound('No se pudo identificar el inquilino en el dominio: ' . request()->getHost());
        });

        // Registra el error de tenant not found
        $exceptions->renderable(function (TenantNotFound $e) {
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'domain' => request()->getHost()
                ], 404);
            }

            return Inertia::render('Errors/TenantNotFound', [
                'status' => 404,
                'message' => $e->getMessage(),
                'domain' => request()->getHost(),
                'centralDomain' => config('tenancy.central_domains')[0] ?? null
            ]);
        });

        // Maneja errores 404 generales
        $exceptions->renderable(function (NotFoundHttpException $e) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Página no encontrada'], 404);
            }

            return Inertia::render('Errors/NotFound', [
                'status' => 404,
                'message' => 'La página que buscas no existe'
            ]);
        });
    })->create();
