<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Client;
use App\Models\Tenant\Product;
use App\Models\Tenant\Invoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Muestra el dashboard del inquilino
     */
    public function index()
    {
        // Obtener el mes actual y el mes anterior
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();
        $sixMonthsAgo = $now->copy()->subMonths(6)->startOfMonth();

        // Calcular ventas del mes actual y anterior
        $currentMonthSales = Invoice::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid')
            ->sum('total');
        $lastMonthSales = Invoice::whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
            ->where('status', 'paid')
            ->sum('total');
        
        // Calcular el cambio porcentual en ventas
        $salesChange = $lastMonthSales > 0 
            ? (($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100 
            : 100;

        // Obtener estadísticas de clientes
        $totalClients = Client::count();
        $newClients = Client::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthClients = Client::where('created_at', '>=', $startOfLastMonth)
            ->where('created_at', '<', $startOfMonth)
            ->count();
        $clientsChange = $lastMonthClients > 0 
            ? (($newClients - $lastMonthClients) / $lastMonthClients) * 100 
            : 100;

        // Obtener estadísticas de productos
        $totalProducts = Product::count();
        $newProducts = Product::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthProducts = Product::where('created_at', '>=', $startOfLastMonth)
            ->where('created_at', '<', $startOfMonth)
            ->count();
        $productsChange = $lastMonthProducts > 0 
            ? (($newProducts - $lastMonthProducts) / $lastMonthProducts) * 100 
            : 100;

        // Obtener estadísticas de facturas
        $totalInvoices = Invoice::count();
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $paidInvoices = Invoice::where('status', 'paid')->count();
        $currentMonthInvoices = Invoice::whereBetween('date', [$startOfMonth, $endOfMonth])->count();
        $lastMonthInvoices = Invoice::whereBetween('date', [$startOfLastMonth, $endOfLastMonth])->count();
        $invoicesChange = $lastMonthInvoices > 0 
            ? (($currentMonthInvoices - $lastMonthInvoices) / $lastMonthInvoices) * 100 
            : 100;

        // Obtener datos para el gráfico de ventas por mes
        $salesByMonth = Invoice::where('date', '>=', $sixMonthsAgo)
            ->where('status', 'paid')
            ->select(
                DB::raw('to_char(date, \'Mon\') as month'),
                DB::raw('to_char(date, \'YYYY-MM\') as month_order'),
                DB::raw('SUM(total) as total')
            )
            ->groupBy('month', 'month_order')
            ->orderBy('month_order')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->month,
                    'value' => (float) $item->total
                ];
            });

        // Obtener datos para el gráfico de facturas por estado
        $invoicesByStatus = Invoice::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->status),
                    'value' => $item->total
                ];
            });

        // Obtener actividad reciente
        $recentInvoices = Invoice::with('client')
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'client_name' => $invoice->client->name,
                    'total' => $invoice->total,
                    'status' => $invoice->status,
                    'date' => $invoice->date
                ];
            });

        $recentClients = Client::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'document_number' => $client->document_number,
                    'created_at' => $client->created_at
                ];
            });

        $recentProducts = Product::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'created_at' => $product->created_at
                ];
            });

        return Inertia::render('Tenant/Dashboard', [
            'dashboardData' => [
                'stats' => [
                    'sales' => [
                        'current' => $currentMonthSales,
                        'previous' => $lastMonthSales,
                        'change' => $salesChange
                    ],
                    'clients' => [
                        'total' => $totalClients,
                        'new' => $newClients,
                        'change' => $clientsChange
                    ],
                    'products' => [
                        'total' => $totalProducts,
                        'new' => $newProducts,
                        'change' => $productsChange
                    ],
                    'invoices' => [
                        'total' => $totalInvoices,
                        'pending' => $pendingInvoices,
                        'paid' => $paidInvoices,
                        'change' => $invoicesChange
                    ]
                ],
                'charts' => [
                    'salesByMonth' => $salesByMonth,
                    'invoicesByStatus' => $invoicesByStatus
                ],
                'recentActivity' => [
                    'invoices' => $recentInvoices,
                    'clients' => $recentClients,
                    'products' => $recentProducts
                ]
            ]
        ]);
    }
}