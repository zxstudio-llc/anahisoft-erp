<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionPlanController extends Controller
{
    /**
     * Muestra la lista de planes de suscripción
     */
    public function index()
    {
        $plans = SubscriptionPlan::orderBy('price')->get();
        
        return Inertia::render('Central/Subscriptions/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Muestra el formulario para crear un plan de suscripción
     */
    public function create()
    {
        return Inertia::render('Central/Subscriptions/Plans/Create');
    }

    /**
     * Almacena un nuevo plan de suscripción
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|string|in:monthly,yearly',
            'invoice_limit' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);
        
        // Generar slug a partir del nombre
        $validated['slug'] = Str::slug($validated['name']);
        
        try {
            DB::beginTransaction();
            
            $plan = SubscriptionPlan::create($validated);
            
            DB::commit();
            
            return redirect()->route('subscription-plans.index')
                ->with('success', 'Plan de suscripción creado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'Error al crear el plan de suscripción: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Muestra el formulario para editar un plan de suscripción
     */
    public function edit(SubscriptionPlan $plan)
    {
        return Inertia::render('Central/Subscriptions/Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    /**
     * Actualiza un plan de suscripción
     */
    public function update(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|string|in:monthly,yearly',
            'invoice_limit' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);
        
        // Actualizar slug solo si el nombre ha cambiado
        if ($plan->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        try {
            DB::beginTransaction();
            
            $plan->update($validated);
            
            DB::commit();
            
            return redirect()->route('subscription-plans.index')
                ->with('success', 'Plan de suscripción actualizado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'Error al actualizar el plan de suscripción: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Elimina un plan de suscripción
     */
    public function destroy(SubscriptionPlan $plan)
    {
        try {
            DB::beginTransaction();
            
            // Verificar si hay tenants usando este plan
            $tenantsCount = $plan->tenants()->count();
            if ($tenantsCount > 0) {
                return back()->withErrors([
                    'error' => 'No se puede eliminar el plan porque hay inquilinos que lo están usando.',
                ]);
            }
            
            $plan->delete();
            
            DB::commit();
            
            return redirect()->route('subscription-plans.index')
                ->with('success', 'Plan de suscripción eliminado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'error' => 'Error al eliminar el plan de suscripción: ' . $e->getMessage(),
            ]);
        }
    }
} 