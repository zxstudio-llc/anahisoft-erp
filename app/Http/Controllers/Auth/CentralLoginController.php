<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CentralLoginController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request)
    {
        // Validar RUC
        $data = $request->validate([
            'ruc' => ['required', 'digits:13'],
        ]);

        // Buscar tenant
        $tenant = Tenant::whereJsonContains('data->ruc', $data['ruc'])->first();

        if (!$tenant || !$tenant->is_active) {
            throw ValidationException::withMessages([
                'ruc' => 'RUC no encontrado o empresa desactivada.',
            ]);
        }

        // Obtener dominio ya existente del tenant
        $domain = $tenant->domains()->first(); // <- usa el dominio que ya tiene registrado

        if (!$domain) {
            throw ValidationException::withMessages([
                'ruc' => 'No se ha configurado un dominio para este tenant.',
            ]);
        }

        // Redirigir al login del tenant
        $redirectUrl = "https://{$domain->domain}/login";

        return Inertia::location($redirectUrl);
    }

}
