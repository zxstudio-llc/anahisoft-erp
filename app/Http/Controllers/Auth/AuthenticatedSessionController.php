<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        // Check if we're in a tenant context
        $isTenant = app()->bound('tenancy.tenant');
        $tenantData = null;
        
        if ($isTenant) {
            $tenant = app('tenancy.tenant');
            $tenantData = [
                'company_name' => $tenant->data['company_name'] ?? null,
                'ruc' => $tenant->data['ruc'] ?? null,
            ];
        }
        
        // Determine which view to render based on context
        $view = $isTenant ? 'app/auth/login' : 'auth/login';
        
        return Inertia::render($view, [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'tenantData' => $tenantData,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // First, check if we're already in a tenant context
        $isTenant = app()->bound('tenancy.tenant');
        
        if (!$isTenant) {
            // We're in the central domain, need to find tenant by RUC and redirect
            $tenant = Tenant::whereJsonContains('data->ruc', $request->ruc)->first();
            
            if (!$tenant) {
                throw ValidationException::withMessages([
                    'ruc' => 'No se encontró una empresa registrada con este RUC.',
                ]);
            }
            
            // Check if tenant is active
            if (!$tenant->is_active) {
                throw ValidationException::withMessages([
                    'ruc' => 'La empresa está desactivada. Contacte al administrador.',
                ]);
            }
            
            // Get tenant domain
            $domain = $tenant->domains()->first();
            if (!$domain) {
                throw ValidationException::withMessages([
                    'ruc' => 'Error en la configuración del dominio. Contacte al administrador.',
                ]);
            }
            
            // Redirect to tenant login with form data
            $redirectUrl = "https://{$domain->domain}/login?" . http_build_query([
                'email' => $request->email,
                'ruc' => $request->ruc,
                'remember' => $request->boolean('remember') ? '1' : '0'
            ]);
            
            return redirect()->away($redirectUrl);
        }
        
        // We're in tenant context, proceed with normal authentication
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