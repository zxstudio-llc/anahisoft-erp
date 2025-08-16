<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Show the form for editing the company settings.
     */
    public function edit()
    {
        return Inertia::render('Settings/Company/Edit', [
            'company' => [
                'name' => config('app.name'),
                'email' => config('mail.from.address'),
                'phone' => config('company.phone'),
                'address' => config('company.address'),
                'tax_id' => config('company.tax_id'),
            ],
        ]);
    }

    /**
     * Update the company settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:255'],
        ]);

        // Aquí deberías implementar la lógica para guardar la configuración
        // Por ejemplo, usando el sistema de configuración de Laravel
        // o guardando en la base de datos

        return redirect()->route('admin.settings.company')
            ->with('success', 'Configuración de la empresa actualizada correctamente.');
    }
} 