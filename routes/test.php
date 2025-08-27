<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

Route::get('/test-registration', function () {
    return response('<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="' . csrf_token() . '">
    <title>Test de Registro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px 20px; margin: 5px; background: #007cba; color: white; border: none; cursor: pointer; }
        button:hover { background: #005a8b; }
        #results { margin-top: 20px; padding: 10px; background: #f5f5f5; white-space: pre-wrap; font-family: monospace; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>🧪 Test de Registro - Debug</h1>
    <p>Esta página te ayudará a debuggear el proceso de registro paso a paso.</p>
    
    <h2>1. Probar Registro Completo</h2>
    <button onclick="testRegistration()">🚀 Probar Registro</button>
    
    <h2>2. Ver Logs del Sistema</h2>
    <button onclick="viewLogs()">📄 Ver Logs Recientes</button>
    <button onclick="clearLogs()">🗑️ Limpiar Logs</button>
    
    <h2>3. Verificar Base de Datos</h2>
    <button onclick="checkDatabase()">🔍 Verificar Tablas</button>
    
    <div id="results"></div>
    
    <script>
    function testRegistration() {
        document.getElementById("results").innerHTML = "⏳ Iniciando test de registro...";
        
        fetch("/test-registration-process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector("meta[name=csrf-token]").content
            },
            body: JSON.stringify({
                name: "allan velez",
                email: "admin@example2.com", 
                password: "Password",
                password_confirmation: "Password",
                company_name: "VELEZ PEÑA ALLAN STUART",
                ruc: "0940440167001",
                domain: "velezpenaallanstuart",
                plan_id: 1,
                billing_period: "monthly"
            })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("results").innerHTML = "✅ RESULTADO DEL TEST:\n\n" + JSON.stringify(data, null, 2);
        })
        .catch(error => {
            document.getElementById("results").innerHTML = "❌ ERROR: " + error.message;
        });
    }
    
    function viewLogs() {
        document.getElementById("results").innerHTML = "📄 Cargando logs...";
        fetch("/test-view-logs")
        .then(response => response.text())
        .then(data => {
            document.getElementById("results").innerHTML = "📄 LOGS RECIENTES:\n\n" + data;
        });
    }
    
    function clearLogs() {
        fetch("/test-clear-logs", { method: "POST", headers: {"X-CSRF-TOKEN": document.querySelector("meta[name=csrf-token]").content} })
        .then(response => response.text())
        .then(data => {
            document.getElementById("results").innerHTML = "🗑️ " + data;
        });
    }
    
    function checkDatabase() {
        document.getElementById("results").innerHTML = "🔍 Verificando base de datos...";
        fetch("/test-check-database")
        .then(response => response.json())
        .then(data => {
            document.getElementById("results").innerHTML = "🔍 ESTADO DE LA BASE DE DATOS:\n\n" + JSON.stringify(data, null, 2);
        });
    }
    </script>
</body>
</html>');
});

Route::post('/test-registration-process', function (Request $request) {
    Log::info('=== INICIANDO TEST DE REGISTRO ===');

    try {
        $data = $request->all();
        Log::info('Datos recibidos para test:', $data);

        // 1. Verificar plan
        $plan = SubscriptionPlan::find($data['plan_id']);
        if (!$plan) {
            throw new \Exception('Plan no encontrado');
        }
        Log::info('Plan verificado:', ['plan' => $plan->toArray()]);

        // 2. Limpiar datos existentes para test
        $existingTenant = Tenant::whereJsonContains('data->ruc', $data['ruc'])->first();
        if ($existingTenant) {
            Log::info('Eliminando tenant existente para test:', ['tenant_id' => $existingTenant->id]);
            $existingTenant->domains()->delete();
            Subscription::where('tenant_id', $existingTenant->id)->delete();
            $existingTenant->delete();
        }

        $existingByDomain = Tenant::where('id', $data['domain'])->first();
        if ($existingByDomain) {
            Log::info('Eliminando tenant existente por dominio:', ['tenant_id' => $existingByDomain->id]);
            $existingByDomain->domains()->delete();
            Subscription::where('tenant_id', $existingByDomain->id)->delete();
            $existingByDomain->delete();
        }

        $existingUser = User::where('email', $data['email'])->first();
        if ($existingUser) {
            Log::info('Eliminando usuario existente para test');
            $existingUser->delete();
        }

        // Limpiar dominios huérfanos
        $domainName = $data['domain'] . '.facturacion.test';
        $existingDomain = \Stancl\Tenancy\Database\Models\Domain::where('domain', $domainName)->first();
        if ($existingDomain) {
            Log::info('Eliminando dominio huérfano:', ['domain' => $domainName]);
            $existingDomain->delete();
        }

        // 3. Crear tenant
        $now = now();
        $isFreePlan = !$plan || $plan->price == 0;

        if ($isFreePlan) {
            $trialEndsAt = $now->copy()->addDays(5)->endOfDay();
            $subscriptionEndsAt = $trialEndsAt->copy()->addDays(30)->endOfDay();
        } else {
            $trialEndsAt = null;
            $subscriptionEndsAt = $data['billing_period'] === 'yearly'
                ? $now->copy()->addYear()
                : $now->copy()->addMonth();
        }

        $tenantData = [
            'id' => $data['domain'],
            'subscription_plan_id' => $data['plan_id'],
            'billing_period' => $data['billing_period'],
            'subscription_active' => true,
            'is_active' => true,
            'trial_ends_at' => $trialEndsAt,
            'subscription_ends_at' => $subscriptionEndsAt,
            'data' => [
                'company_name' => $data['company_name'],
                'ruc' => $data['ruc'],
                'plan_name' => $plan ? $plan->name : 'Plan Gratuito',
                'plan_price' => $plan ? $plan->price : 0,
            ],
        ];

        Log::info('Creando tenant con datos:', $tenantData);
        $tenant = Tenant::create($tenantData);

        // 4. Crear suscripción
        $subscriptionData = [
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $data['plan_id'],
            'name' => $plan ? $plan->name : 'Plan Gratuito',
            'plan_type' => $isFreePlan ? 'basic' : 'standard',
            'quantity' => 1,
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => $subscriptionEndsAt,
            'status' => 'active',
        ];
        Subscription::create($subscriptionData);

        // 5. Crear dominio
        $domain = $tenant->domains()->create(['domain' => $domainName]);

        // 6. Inicializar datos del tenant
        $tenant->run(function () use ($data) {
            DB::transaction(function () use ($data) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                ]);

                $adminRole = Role::create(['name' => 'admin']);
                $user->assignRole($adminRole);

                $permissions = ['view-dashboard', 'manage-users', 'manage-roles', 'manage-settings'];
                foreach ($permissions as $permission) {
                    Permission::create(['name' => $permission]);
                }
                $adminRole->givePermissionTo($permissions);
            });
        });

        return response()->json([
            'success' => true,
            'message' => 'Registro completado exitosamente',
            'tenant_id' => $tenant->id,
            'domain' => $domain->domain,
            'user_email' => $data['email']
        ]);

    } catch (\Throwable $e) { // <---- ahora atrapa todo, no solo Exception
        Log::error('ERROR EN TEST DE REGISTRO:', [
            'message' => $e->getMessage(),
            'file'   => $e->getFile(),
            'line'   => $e->getLine(),
            'trace'  => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine()
        ], 500);
    }
});


Route::get('/test-view-logs', function () {
    $logPath = storage_path('logs/laravel.log');
    
    if (!file_exists($logPath)) {
        return 'No hay archivo de log disponible en: ' . $logPath;
    }
    
    $logs = file_get_contents($logPath);
    $lines = explode("\n", $logs);
    
    // Obtener las últimas 100 líneas que contengan información relevante
    $recentLines = array_slice($lines, -100);
    $filteredLines = array_filter($recentLines, function($line) {
        return !empty(trim($line)) && (
            strpos($line, 'REGISTRO') !== false ||
            strpos($line, 'ERROR') !== false ||
            strpos($line, 'tenant') !== false ||
            strpos($line, 'subscription') !== false
        );
    });
    
    return implode("\n", $filteredLines);
});

Route::post('/test-clear-logs', function () {
    $logPath = storage_path('logs/laravel.log');
    
    if (file_exists($logPath)) {
        file_put_contents($logPath, '');
        return 'Logs limpiados exitosamente';
    }
    
    return 'No hay archivo de log para limpiar';
});

Route::get('/test-check-database', function () {
    try {
        $data = [];
        
        // Verificar planes
        $plans = SubscriptionPlan::all(['id', 'name', 'price']);
        $data['subscription_plans'] = $plans->toArray();
        
        // Verificar tenants existentes
        $tenants = Tenant::with(['subscriptionPlan'])->get(['id', 'subscription_plan_id', 'is_active', 'data']);
        $data['tenants'] = $tenants->toArray();
        
        // Verificar subscriptions
        $subscriptions = Subscription::all(['id', 'tenant_id', 'subscription_plan_id', 'name', 'status']);
        $data['subscriptions'] = $subscriptions->toArray();
        
        // Verificar dominios
        $domains = \Stancl\Tenancy\Database\Models\Domain::all(['id', 'domain', 'tenant_id']);
        $data['domains'] = $domains->toArray();
        
        // Verificar configuración
        $data['config'] = [
            'central_domains' => config('tenancy.central_domains'),
            'app_env' => config('app.env'),
            'log_level' => config('logging.level'),
        ];
        
        return response()->json($data);
        
    } catch (Exception $e) {
        return response()->json([
            'error' => 'Error al verificar base de datos',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
    }
});