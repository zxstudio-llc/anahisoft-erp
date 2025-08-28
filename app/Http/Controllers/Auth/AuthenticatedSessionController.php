<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\AdminLoginRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Facades\Tenancy;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
{
    $tenantData = null;

    // Intentar pre-cargar tenantData desde query param o central
    $ruc = $request->query('ruc'); 
    if ($ruc) {
        $tenant = \App\Models\Tenant::whereJsonContains('data->ruc', $ruc)->first();
        if ($tenant) {
            $tenantData = [
                'trade_name' => $tenant->data['trade_name'] ?? null,
                'ruc' => $tenant->data['ruc'] ?? null,
            ];
        }
    }

    // Siempre renderizamos domain-login
    return Inertia::render('auth/domain-login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => $request->session()->get('status'),
        'tenantData' => $tenantData,
    ]);
}


    /**
     * Show the admin login page (for superadmins).
     */
    public function createAdmin(Request $request): Response
    {
        return Inertia::render('auth/admin-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the Tenant login page (for Tenant).
     */
    public function createTenant(Request $request): Response
    {
        // Asegurarse de que estamos en contexto tenant
        if (!tenancy()->initialized) {
            abort(404);
        }

        $tenant = tenancy()->tenant;

        return Inertia::render('auth/domain-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'tenantData' => [
                'trade_name' => $tenant->data['trade_name'] ?? null,
                'ruc' => $tenant->data['ruc'] ?? null,
            ],
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
{
    // 1️⃣ Verificar si ya estamos en un tenant
    $isTenant = tenancy()->initialized;

    if ($isTenant) {
        // Login directo en tenant
        $credentials = $request->only('email', 'password');
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Credenciales incorrectas.',
            ]);
        }

        $request->session()->regenerate();

        // Crear token si no existe
        if (!$request->user()->tokens()->where('name', 'default_token')->exists()) {
            $request->user()->createToken('default_token', ['*']);
        }

        return redirect()->route('tenant.dashboard');
    }

    // 2️⃣ Login desde central, buscar tenant por RUC
    $tenant = Tenant::whereJsonContains('data->ruc', $request->ruc)->first();

    if (!$tenant || !$tenant->is_active) {
        throw ValidationException::withMessages([
            'ruc' => 'RUC no encontrado o empresa desactivada.',
        ]);
    }

    // 3️⃣ Inicializar el tenant
    tenancy()->initialize($tenant);

    try {
        // 4️⃣ Autenticar usuario en base de datos del tenant
        $credentials = $request->only('email', 'password');
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Credenciales incorrectas.',
            ]);
        }

        $request->session()->regenerate();

        // 5️⃣ Crear token API si no existe
        if (!$request->user()->tokens()->where('name', 'default_token')->exists()) {
            $request->user()->createToken('default_token', ['*']);
        }

        // 6️⃣ Redirigir al dashboard del tenant
        return redirect()->route('tenant.dashboard');
    } finally {
        // Opcional: tenancy()->end(); si quieres limpiar el contexto
    }
}


    /**
     * Handle admin authentication request (for superadmins).
     */
    public function storeAdmin(AdminLoginRequest $request): RedirectResponse
    {
        // Authenticate without requiring RUC
        $request->authenticate();

        $request->session()->regenerate();

        // Generar token API si es necesario
        if (!$request->user()->tokens()->where('name', 'default_token')->exists()) {
            $request->user()->createToken('default_token', ['*']);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}