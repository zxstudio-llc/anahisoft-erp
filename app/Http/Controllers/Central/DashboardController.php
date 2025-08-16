<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;
use App\Models\User;
use Stancl\Tenancy\Database\Models\Domain;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $tenants = Tenant::all();
        $domains = Domain::all();
        $users = User::all();
        
        // Datos para gráficos
        $tenantsPerMonth = $this->getTenantsPerMonth();
        $domainsPerTenant = $this->getDomainsPerTenant();
        $tenantStats = $this->getTenantStats();
        $trendStats = $this->getTrendStats();
        
        return Inertia::render('Central/Dashboard', [
            'tenants' => $tenants,
            'domains' => $domains,
            'users' => $users,
            'chartData' => [
                'tenantsPerMonth' => $tenantsPerMonth,
                'domainsPerTenant' => $domainsPerTenant,
                'tenantStats' => $tenantStats,
                'trendStats' => $trendStats,
            ],
        ]);
    }
    
    private function getTenantsPerMonth()
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6);
        
        $tenantsByMonth = Tenant::where('created_at', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(function ($tenant) {
                return Carbon::parse($tenant->created_at)->format('M');
            })
            ->map(function ($group) {
                return $group->count();
            });
            
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i)->format('M');
            $months[$month] = $tenantsByMonth[$month] ?? 0;
        }
        
        $result = [];
        foreach ($months as $month => $count) {
            $result[] = [
                'name' => $month,
                'value' => $count
            ];
        }
        
        return $result;
    }
    
    private function getDomainsPerTenant()
    {
        $tenants = Tenant::withCount('domains')->get();
        
        return $tenants->map(function ($tenant) {
            return [
                'name' => $tenant->id,
                'value' => $tenant->domains_count
            ];
        })->take(10);
    }
    
    private function getTenantStats()
    {
        return [
            ['name' => 'Activos', 'value' => Tenant::count()],
            ['name' => 'Nuevos (30 días)', 'value' => Tenant::where('created_at', '>=', Carbon::now()->subDays(30))->count()],
            ['name' => 'Dominios', 'value' => Domain::count()],
            ['name' => 'Usuarios', 'value' => User::count()]
        ];
    }
    
    private function getTrendStats()
    {
        // Calcular tendencias comparando períodos
        $currentMonthTenants = Tenant::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
        $lastMonthTenants = Tenant::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->count();
        
        $tenantTrendPercent = $lastMonthTenants > 0 
            ? round((($currentMonthTenants - $lastMonthTenants) / $lastMonthTenants) * 100, 1)
            : 100;
        
        $currentMonthUsers = User::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
        $lastMonthUsers = User::where('created_at', '>=', Carbon::now()->subMonth()->startOfMonth())
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->count();
        
        $userTrendPercent = $lastMonthUsers > 0 
            ? round((($currentMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
            : 100;
        
        return [
            [
                'title' => 'Inquilinos este mes',
                'value' => $currentMonthTenants,
                'trend' => [
                    'value' => abs($tenantTrendPercent) . '%',
                    'positive' => $tenantTrendPercent >= 0
                ],
                'description' => 'Comparado con el mes anterior'
            ],
            [
                'title' => 'Usuarios este mes',
                'value' => $currentMonthUsers,
                'trend' => [
                    'value' => abs($userTrendPercent) . '%',
                    'positive' => $userTrendPercent >= 0
                ],
                'description' => 'Comparado con el mes anterior'
            ],
            [
                'title' => 'Dominios por inquilino',
                'value' => $this->getAverageDomainsPerTenant(),
                'trend' => [
                    'value' => '10%',
                    'positive' => true
                ],
                'description' => 'Promedio de dominios por inquilino'
            ],
            [
                'title' => 'Tasa de conversión',
                'value' => '68%',
                'trend' => [
                    'value' => '5%',
                    'positive' => true
                ],
                'description' => 'Inquilinos activos vs registrados'
            ]
        ];
    }
    
    private function getAverageDomainsPerTenant()
    {
        $tenantCount = Tenant::count();
        if ($tenantCount === 0) {
            return 0;
        }
        
        $domainCount = Domain::count();
        return round($domainCount / $tenantCount, 1);
    }
}
