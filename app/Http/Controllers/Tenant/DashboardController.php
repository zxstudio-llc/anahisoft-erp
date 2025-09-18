<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Customer;
use App\Models\Tenant\Products;
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
        $currentMonthSales = Invoice::whereBetween('issue_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid')
            ->sum('total');
        $lastMonthSales = Invoice::whereBetween('issue_date', [$startOfLastMonth, $endOfLastMonth])
            ->where('status', 'paid')
            ->sum('total');
        
        // Calcular el cambio porcentual en ventas
        $salesChange = $lastMonthSales > 0 
            ? (($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100 
            : 100;

        // Obtener estadísticas de customer
        $totalCustomers = Customer::count();
        $newCustomers = Customer::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthCustomers = Customer::where('created_at', '>=', $startOfLastMonth)
            ->where('created_at', '<', $startOfMonth)
            ->count();
        $customersChange = $lastMonthCustomers > 0 
            ? (($newCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100 
            : 100;

        // Obtener estadísticas de productos
        $totalProducts = Products::count();
        $newProducts = Products::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthProducts = Products::where('created_at', '>=', $startOfLastMonth)
            ->where('created_at', '<', $startOfMonth)
            ->count();
        $productsChange = $lastMonthProducts > 0 
            ? (($newProducts - $lastMonthProducts) / $lastMonthProducts) * 100 
            : 100;

        // Obtener estadísticas de facturas
        $totalInvoices = Invoice::count();
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $paidInvoices = Invoice::where('status', 'paid')->count();
        $currentMonthInvoices = Invoice::whereBetween('issue_date', [$startOfMonth, $endOfMonth])->count();
        $lastMonthInvoices = Invoice::whereBetween('issue_date', [$startOfLastMonth, $endOfLastMonth])->count();
        $invoicesChange = $lastMonthInvoices > 0 
            ? (($currentMonthInvoices - $lastMonthInvoices) / $lastMonthInvoices) * 100 
            : 100;

        // Obtener datos para el gráfico de ventas por mes
        $salesByMonth = Invoice::where('issue_date', '>=', $sixMonthsAgo)
            ->where('status', 'paid')
            ->select(
                DB::raw('to_char(issue_date, \'Mon\') as month'),
                DB::raw('to_char(issue_date, \'YYYY-MM\') as month_order'),
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
        $recentInvoices = Invoice::with('customer')
            ->orderBy('issue_date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($invoice) {
                $customer = $invoice->customer;
                if ($customer) {
                    // Formatear RUC / identificación según tipo
                    $customer->formatted_identification = $customer->identification_type . ' - ' . $customer->identification;
                }        
                return [
                    'id' => $invoice->id,
                    'customer' => $customer,
                    'establishment_code' => $invoice->establishment_code,
                    'emission_point' => $invoice->emission_point,
                    'sequential' => $invoice->sequential,
                    'total' => $invoice->total,
                    'status' => $invoice->status,
                    'issue_date' => $invoice->issue_date
                ];
            });

        $recentCustomers = Customer::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'identification' => $customer->identification,
                    'business_name' => $customer->business_name,
                    'trade_name' => $customer->trade_name,
                    'phone' => $customer->phone,
                    'email' => $customer->email,
                    'active' => $customer->active,
                    'created_at' => $customer->created_at
                ];
            });

        $recentProducts = Products::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'code' => $product->code,
                    'stock' => $product->stock,
                    'active' => $product->active,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
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
                    'customers' => [
                        'total' => $totalCustomers,
                        'new' => $newCustomers,
                        'change' => $customersChange
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
                    'customers' => $recentCustomers,
                    'products' => $recentProducts
                ]
            ]
        ]);
    }
}