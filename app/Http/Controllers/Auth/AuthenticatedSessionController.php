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

        // Verificar si estamos en contexto tenant
        if (tenancy()->initialized) {
            $tenant = tenancy()->tenant;
            $tenantData = [
                'trade_name' => $tenant->trade_name ?? $tenant->data['company_name'] ?? null,
                'ruc' => $tenant->ruc ?? $tenant->data['ruc'] ?? null, // ✅ Usar campo directo primero
                'company_name' => $tenant->data['company_name'] ?? null,
            ];
        } else {
            // En central, intentar pre-cargar tenantData desde query param
            $ruc = $request->query('ruc'); 
            if ($ruc) {
                // ✅ Buscar en ambos lugares: campo directo y JSON
                $tenant = \App\Models\Tenant::where(function ($query) use ($ruc) {
                    $query->where('ruc', $ruc)
                          ->orWhere('data->ruc', $ruc);
                })->first();
                
                if ($tenant) {
                    $tenantData = [
                        'trade_name' => $tenant->trade_name ?? $tenant->data['company_name'] ?? null,
                        'ruc' => $tenant->ruc ?? $tenant->data['ruc'] ?? null,
                        'company_name' => $tenant->data['company_name'] ?? null,
                    ];
                }
            }
        }

        return Inertia::render('auth/domain-login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'tenantData' => $tenantData,
            'isTenant' => tenancy()->initialized,
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
                'trade_name' => $tenant->trade_name ?? $tenant->data['company_name'] ?? null,
                'ruc' => $tenant->ruc ?? $tenant->data['ruc'] ?? null,
                'company_name' => $tenant->data['company_name'] ?? null,
            ],
            'isTenant' => true,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('=== INICIO PROCESO LOGIN ===', [
            'email' => $request->email,
            'ruc' => $request->ruc,
            'is_tenant_initialized' => tenancy()->initialized,
            'url' => $request->url(),
            'domain' => $request->getHost(),
            'method' => $request->method(),
        ]);

        // ✅ 1️⃣ Verificar si ya estamos en un tenant
        $isTenant = tenancy()->initialized;

        if ($isTenant) {
            Log::info('Login directo en tenant');
            return $this->handleTenantLogin($request);
        }

        // ✅ 2️⃣ Login desde central - necesitamos RUC para encontrar el tenant
        if (!$request->has('ruc') || empty($request->ruc)) {
            throw ValidationException::withMessages([
                'ruc' => 'El RUC es requerido para acceder.',
            ]);
        }

        Log::info('Buscando tenant por RUC:', ['ruc' => $request->ruc]);
        
        // ✅ Buscar en ambos lugares: campo directo y JSON
        $tenant = Tenant::where(function ($query) use ($request) {
            $query->where('ruc', $request->ruc)
                  ->orWhere('data->ruc', $request->ruc);
        })->first();

        if (!$tenant || !$tenant->is_active) {
            throw ValidationException::withMessages([
                'ruc' => 'RUC no encontrado o empresa desactivada.',
            ]);
        }

        Log::info('Tenant encontrado:', ['tenant_id' => $tenant->id]);

        // ✅ 3️⃣ Obtener el dominio del tenant
        $domain = $tenant->domains()->first();
        if (!$domain) {
            throw ValidationException::withMessages([
                'ruc' => 'No se ha configurado un dominio para este tenant.',
            ]);
        }

        // ✅ 4️⃣ Si estamos en el dominio central, redirigir al tenant con los datos
        $centralDomains = config('tenancy.central_domains', []);
        $currentDomain = $request->getHost();
        
        if (in_array($currentDomain, $centralDomains)) {
            Log::info('Redirigiendo desde central al tenant', [
                'from' => $currentDomain,
                'to' => $domain->domain
            ]);
            
            // ✅ Redirigir al dominio del tenant CON LOS DATOS DE LOGIN
            $redirectUrl = "https://{$domain->domain}/login";
            
            // Guardar datos temporalmente en la sesión para el próximo request
            session()->flash('pending_login', [
                'email' => $request->email,
                'password' => $request->password,
                'remember' => $request->boolean('remember'),
                'from_central' => true,
            ]);
            
            return redirect()->away($redirectUrl);
        }

        // ✅ 5️⃣ Si llegamos aquí, significa que estamos en el dominio correcto 
        // pero el tenant no está inicializado - inicializarlo
        if (!$isTenant) {
            Log::info('Inicializando tenant manualmente:', ['tenant_id' => $tenant->id]);
            tenancy()->initialize($tenant);
        }
        
        return $this->handleTenantLogin($request);
    }

    /**
     * Manejar el login específicamente en el contexto del tenant
     */
    private function handleTenantLogin(LoginRequest $request): RedirectResponse
    {
        try {
            // ✅ Verificar si hay un login pendiente desde central
            $pendingLogin = session('pending_login');
            if ($pendingLogin && $pendingLogin['from_central']) {
                Log::info('Procesando login pendiente desde central');
                
                $credentials = [
                    'email' => $pendingLogin['email'],
                    'password' => $pendingLogin['password']
                ];
                $remember = $pendingLogin['remember'] ?? false;
                
                // Limpiar datos pendientes
                session()->forget('pending_login');
            } else {
                $credentials = $request->only('email', 'password');
                $remember = $request->boolean('remember');
            }

            Log::info('Intentando autenticar usuario en tenant:', [
                'email' => $credentials['email'],
                'tenant_id' => tenancy()->tenant->id ?? 'no_tenant'
            ]);

            if (!Auth::attempt($credentials, $remember)) {
                Log::warning('Fallo en autenticación:', ['email' => $credentials['email']]);
                
                throw ValidationException::withMessages([
                    'email' => 'Las credenciales proporcionadas no coinciden con nuestros registros.',
                ]);
            }

            $user = Auth::user();
            Log::info('Usuario autenticado correctamente:', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            $request->session()->regenerate();

            // Crear token API si no existe
            if (!$user->tokens()->where('name', 'default_token')->exists()) {
                $user->createToken('default_token', ['*']);
                Log::info('Token API creado para usuario:', ['user_id' => $user->id]);
            }

            // ✅ IMPORTANTE: Verificar si la ruta existe antes de redirigir
            if (Route::has('tenant.dashboard')) {
                return redirect()->route('tenant.dashboard');
            } elseif (Route::has('dashboard')) {
                return redirect()->route('dashboard');
            } else {
                // Fallback: redirigir a la raíz del tenant
                return redirect('/dashboard');
            }
            
        } catch (\Exception $e) {
            Log::error('Error en handleTenantLogin:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
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

        // Si estamos en un tenant, redirigir a su login
        if (tenancy()->initialized) {
            return redirect()->route('login');
        }

        // Si estamos en central, redirigir al home
        return redirect('/');
    }
}