<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\SeoKeyword;
use App\Models\SeoError;
use App\Models\CoreWebVital;
use App\Models\Backlink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '7d');
        $startDate = $this->getStartDate($period);
        $previousStartDate = $this->getStartDate($period, true); // Nuevo parámetro para período anterior
        
        // Obtener métricas actuales
        $currentStats = [
            'totalVisits' => $this->getTotalVisits($startDate),
            'uniqueVisitors' => $this->getTotalUniqueVisitors($startDate),
            'bounceRate' => $this->getBounceRate($startDate),
            'avgTimeOnPage' => $this->getAvgTimeOnPage($startDate),
        ];
        
        // Obtener métricas del período anterior
        $previousStats = [
            'totalVisits' => $this->getTotalVisits($previousStartDate),
            'uniqueVisitors' => $this->getTotalUniqueVisitors($previousStartDate),
            'bounceRate' => $this->getBounceRate($previousStartDate),
            'avgTimeOnPage' => $this->getAvgTimeOnPage($previousStartDate),
        ];
        
        return inertia('app/analytics/index', [
            'viewsByUrl' => $this->getViewsByUrl($startDate),
            'viewsByDay' => $this->getViewsByDay($startDate),
            'trafficSources' => $this->getTrafficSources($startDate),
            'topKeywords' => $this->getTopKeywords($startDate),
            'deviceStats' => $this->getDeviceStats($startDate),
            'bounceRate' => $currentStats['bounceRate'],
            'avgTimeOnPage' => $currentStats['avgTimeOnPage'],
            'conversionRate' => $this->getConversionRate($startDate),
            'topCountriesTraffic' => $this->getTopCountriesTraffic($startDate),
            'coreWebVitals' => $this->getCoreWebVitals($startDate),
            'seoErrors' => $this->getSeoErrors($startDate),
            'period' => $period,
            'currentStats' => $currentStats,
            'previousStats' => $previousStats,
        ]);
    }

    private function getStartDate($period, $previous = false)
    {
        $multiplier = $previous ? 2 : 1;
        
        return match($period) {
            '7d' => Carbon::now()->subDays(7 * $multiplier),
            '30d' => Carbon::now()->subDays(30 * $multiplier),
            '90d' => Carbon::now()->subDays(90 * $multiplier),
            '1y' => Carbon::now()->subYears(1 * $multiplier),
            default => Carbon::now()->subDays(7 * $multiplier)
        };
    }
    
    private function getTotalVisits($startDate)
    {
        return PageView::where('created_at', '>=', $startDate)->count();
    }

    private function getTotalUniqueVisitors($startDate)
    {
        return PageView::where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count('session_id');
    }

    private function getComparisonChange($current, $previous, $invert = false)
    {
        if ($previous == 0) return 0;
        
        $change = (($current - $previous) / $previous) * 100;
        return $invert ? -$change : $change;
    }


    private function getViewsByUrl($startDate)
    {
        return PageView::select([
                'url',
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
                DB::raw('ROUND(AVG(CASE WHEN is_bounce THEN 100 ELSE 0 END), 1) as bounce_rate'),
                DB::raw('ROUND(AVG(time_on_page), 0) as avg_time'),
                DB::raw('SUM(CASE WHEN is_conversion THEN 1 ELSE 0 END) as conversions'),
                DB::raw('ROUND(AVG(CASE WHEN is_conversion THEN 100 ELSE 0 END), 2) as conversion_rate')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy('url')
            ->orderByDesc('total')
            ->limit(20)
            ->get();
    }

    private function getViewsByDay($startDate)
    {
        return PageView::select([
                DB::raw('DATE(created_at) as day'),
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors'),
                DB::raw('ROUND(AVG(CASE WHEN is_bounce THEN 100 ELSE 0 END), 1) as bounce_rate'),
                DB::raw('ROUND(AVG(time_on_page), 0) as avg_time_on_page')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy('day')
            ->orderBy('day')
            ->get();
    }

    private function getTrafficSources($startDate)
    {
        $sources = PageView::select([
                DB::raw('CASE 
                    WHEN utm_source IS NOT NULL THEN CONCAT(utm_source, \' - \', COALESCE(utm_medium, \'unknown\'))
                    WHEN referer LIKE \'%google.%\' THEN \'Google Orgánico\'
                    WHEN referer LIKE \'%facebook.%\' THEN \'Facebook\'
                    WHEN referer LIKE \'%instagram.%\' THEN \'Instagram\'
                    WHEN referer LIKE \'%twitter.%\' OR referer LIKE \'%t.co%\' THEN \'Twitter\'
                    WHEN referer LIKE \'%linkedin.%\' THEN \'LinkedIn\'
                    WHEN referer IS NULL OR referer = \'\' THEN \'Directo\'
                    ELSE \'Referencias\'
                END as source'),
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy('source')
            ->orderByDesc('visits')
            ->get();

        $total = $sources->sum('visits');
        
        return $sources->map(function ($source) use ($total) {
            $source->percentage = round(($source->visits / $total) * 100, 1);
            return $source;
        });
    }

    private function getTopKeywords($startDate)
    {
        return SeoKeyword::select([
                'keyword',
                'url',
                DB::raw('AVG(position) as avg_position'),
                DB::raw('SUM(clicks) as total_clicks'),
                DB::raw('SUM(impressions) as total_impressions'),
                DB::raw('ROUND(AVG(ctr), 2) as avg_ctr')
            ])
            ->where('date', '>=', $startDate->toDateString())
            ->groupBy(['keyword', 'url'])
            ->orderByDesc('total_clicks')
            ->limit(10)
            ->get();
    }

    private function getDeviceStats($startDate)
    {
        $devices = PageView::select([
                'device_type',
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors')
            ])
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('device_type')
            ->groupBy('device_type')
            ->get();

        $total = $devices->sum('visits');
        
        return $devices->map(function ($device) use ($total) {
            $device->percentage = round(($device->visits / $total) * 100, 1);
            return $device;
        });
    }

    private function getBounceRate($startDate)
    {
        return PageView::where('created_at', '>=', $startDate)
            ->selectRaw("ROUND(AVG(CASE WHEN is_bounce THEN 100 ELSE 0 END), 1) as bounce_rate")
            ->first()
            ->bounce_rate ?? 0;
    }


    private function getAvgTimeOnPage($startDate)
    {
        return PageView::where('created_at', '>=', $startDate)
            ->avg('time_on_page') ?? 0;
    }

    private function getConversionRate($startDate)
    {
        $total = PageView::where('created_at', '>=', $startDate)->count();
        $conversions = PageView::where('created_at', '>=', $startDate)
            ->where('is_conversion', true)
            ->count();
        
        return $total > 0 ? round(($conversions / $total) * 100, 2) : 0;
    }

    private function getTopCountriesTraffic($startDate)
    {
        return PageView::select([
                'country',
                DB::raw('COUNT(*) as visits'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors')
            ])
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();
    }

    private function getCoreWebVitals($startDate)
    {
        return CoreWebVital::select([
                'url',
                'device_type',
                DB::raw('ROUND(AVG(lcp), 2) as avg_lcp'),
                DB::raw('ROUND(AVG(fid), 2) as avg_fid'),
                DB::raw('ROUND(AVG(cls), 4) as avg_cls'),
                DB::raw('ROUND(AVG(fcp), 2) as avg_fcp'),
                DB::raw('ROUND(AVG(ttfb), 2) as avg_ttfb')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy(['url', 'device_type'])
            ->orderBy('url')
            ->get();
    }

    private function getSeoErrors($startDate)
    {
        return SeoError::select([
                'url',
                'status_code',
                'error_type',
                'count',
                'last_seen'
            ])
            ->where('last_seen', '>=', $startDate)
            ->orderByDesc('count')
            ->limit(20)
            ->get();
    }

    // Método para capturar las métricas en tiempo real
    public function trackPageView(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'title' => 'nullable|string',
            'referrer' => 'nullable|string',
            'time_on_page' => 'nullable|integer',
            'screen_resolution' => 'nullable|string',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_term' => 'nullable|string',
            'utm_content' => 'nullable|string',
        ]);

        // Detectar información del usuario
        $userAgent = $request->userAgent();
        $device = $this->detectDevice($userAgent);
        $location = $this->getLocationFromIP($request->ip());
        
        PageView::create([
            'url' => $data['url'],
            'title' => $data['title'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'referer' => $data['referrer'] ?? $request->header('referer'),
            'time_on_page' => $data['time_on_page'] ?? 0,
            'device_type' => $device['type'],
            'browser' => $device['browser'],
            'os' => $device['os'],
            'screen_resolution' => $data['screen_resolution'],
            'country' => $location['country'] ?? null,
            'city' => $location['city'] ?? null,
            'utm_source' => $data['utm_source'],
            'utm_medium' => $data['utm_medium'],
            'utm_campaign' => $data['utm_campaign'],
            'utm_term' => $data['utm_term'],
            'utm_content' => $data['utm_content'],
            'session_id' => $request->session()->getId(),
            'is_new_visitor' => !$request->session()->has('returning_visitor'),
            'visited_at' => now(),
        ]);

        // Marcar como visitante recurrente
        $request->session()->put('returning_visitor', true);

        return response()->json(['status' => 'success']);
    }

    // Método para registrar conversiones
    public function trackConversion(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'conversion_type' => 'required|string',
            'conversion_value' => 'nullable|numeric',
        ]);

        PageView::create([
            'url' => $data['url'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()->getId(),
            'is_conversion' => true,
            'conversion_type' => $data['conversion_type'],
            'conversion_value' => $data['conversion_value'],
            'visited_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    // Método para registrar Core Web Vitals
    public function trackCoreWebVitals(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'lcp' => 'nullable|numeric',
            'fid' => 'nullable|numeric',
            'cls' => 'nullable|numeric',
            'fcp' => 'nullable|numeric',
            'ttfb' => 'nullable|numeric',
        ]);

        $userAgent = $request->userAgent();
        $device = $this->detectDevice($userAgent);

        CoreWebVital::create([
            'url' => $data['url'],
            'lcp' => $data['lcp'],
            'fid' => $data['fid'],
            'cls' => $data['cls'],
            'fcp' => $data['fcp'],
            'ttfb' => $data['ttfb'],
            'device_type' => $device['type'],
        ]);

        return response()->json(['status' => 'success']);
    }

    private function detectDevice($userAgent)
    {
        $device = [
            'type' => 'desktop',
            'browser' => 'unknown',
            'os' => 'unknown'
        ];

        // Detectar tipo de dispositivo
        if (preg_match('/mobile|android|iphone|ipad|phone/i', $userAgent)) {
            if (preg_match('/ipad|tablet/i', $userAgent)) {
                $device['type'] = 'tablet';
            } else {
                $device['type'] = 'mobile';
            }
        }

        // Detectar navegador
        if (preg_match('/chrome/i', $userAgent)) {
            $device['browser'] = 'Chrome';
        } elseif (preg_match('/firefox/i', $userAgent)) {
            $device['browser'] = 'Firefox';
        } elseif (preg_match('/safari/i', $userAgent)) {
            $device['browser'] = 'Safari';
        } elseif (preg_match('/edge/i', $userAgent)) {
            $device['browser'] = 'Edge';
        }

        // Detectar OS
        if (preg_match('/windows/i', $userAgent)) {
            $device['os'] = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $device['os'] = 'macOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $device['os'] = 'Linux';
        } elseif (preg_match('/android/i', $userAgent)) {
            $device['os'] = 'Android';
        } elseif (preg_match('/iphone|ipad/i', $userAgent)) {
            $device['os'] = 'iOS';
        }

        return $device;
    }

    private function getLocationFromIP($ip)
    {
        // Aquí puedes integrar un servicio como GeoIP2, IPinfo, etc.
        // Por ahora retornamos datos de ejemplo
        try {
            // Ejemplo con ipinfo.io (requiere clave API)
            // $response = Http::get("https://ipinfo.io/{$ip}?token=YOUR_TOKEN");
            // return $response->json();
            
            return [
                'country' => 'Ecuador', // Valor por defecto basado en tu ubicación
                'city' => 'Guayaquil'
            ];
        } catch (\Exception $e) {
            return ['country' => null, 'city' => null];
        }
    }

    // Dashboard de SEO específico
    public function seoReport(Request $request)
    {
        $period = $request->get('period', '30d');
        $startDate = $this->getStartDate($period);

        return inertia('app/analytics/seo-report', [
            'keywordRankings' => $this->getKeywordRankings($startDate),
            'backlinksReport' => $this->getBacklinksReport(),
            'technicalSeoIssues' => $this->getTechnicalSeoIssues($startDate),
            'coreWebVitalsReport' => $this->getCoreWebVitalsReport($startDate),
            'organicTrafficTrend' => $this->getOrganicTrafficTrend($startDate),
            'topLandingPages' => $this->getTopLandingPages($startDate),
            'crawlErrors' => $this->getCrawlErrors($startDate),
        ]);
    }

    private function getKeywordRankings($startDate)
    {
        return SeoKeyword::select([
                'keyword',
                'url',
                'position',
                'clicks',
                'impressions',
                'ctr',
                DB::raw('LAG(position) OVER (PARTITION BY keyword ORDER BY date) as previous_position')
            ])
            ->where('date', '>=', $startDate->toDateString())
            ->orderBy('clicks', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($keyword) {
                $keyword->position_change = $keyword->previous_position 
                    ? $keyword->previous_position - $keyword->position 
                    : 0;
                return $keyword;
            });
    }

    private function getBacklinksReport()
    {
        return [
            'total_backlinks' => Backlink::where('is_active', true)->count(),
            'new_backlinks' => Backlink::where('first_detected', '>=', Carbon::now()->subDays(30))->count(),
            'lost_backlinks' => Backlink::where('is_active', false)
                ->where('last_checked', '>=', Carbon::now()->subDays(30))
                ->count(),
            'top_referring_domains' => Backlink::select([
                    DB::raw('SUBSTRING_INDEX(SUBSTRING_INDEX(source_url, "/", 3), "/", -1) as domain'),
                    DB::raw('COUNT(*) as backlink_count'),
                    DB::raw('AVG(domain_authority) as avg_domain_authority')
                ])
                ->where('is_active', true)
                ->groupBy('domain')
                ->orderByDesc('backlink_count')
                ->limit(10)
                ->get()
        ];
    }

    private function getTechnicalSeoIssues($startDate)
    {
        return SeoError::select([
                'error_type',
                DB::raw('COUNT(DISTINCT url) as affected_urls'),
                DB::raw('SUM(count) as total_occurrences')
            ])
            ->where('last_seen', '>=', $startDate)
            ->groupBy('error_type')
            ->orderByDesc('total_occurrences')
            ->get();
    }

    private function getCoreWebVitalsReport($startDate)
    {
        return CoreWebVital::select([
                'device_type',
                DB::raw('ROUND(AVG(lcp), 2) as avg_lcp'),
                DB::raw('ROUND(AVG(fid), 2) as avg_fid'),
                DB::raw('ROUND(AVG(cls), 4) as avg_cls'),
                DB::raw('COUNT(*) as sample_size')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy('device_type')
            ->get()
            ->map(function ($vital) {
                // Evaluar rendimiento según los umbrales de Google
                $vital->lcp_score = $vital->avg_lcp <= 2.5 ? 'good' : ($vital->avg_lcp <= 4.0 ? 'needs_improvement' : 'poor');
                $vital->fid_score = $vital->avg_fid <= 100 ? 'good' : ($vital->avg_fid <= 300 ? 'needs_improvement' : 'poor');
                $vital->cls_score = $vital->avg_cls <= 0.1 ? 'good' : ($vital->avg_cls <= 0.25 ? 'needs_improvement' : 'poor');
                return $vital;
            });
    }

    private function getOrganicTrafficTrend($startDate)
    {
        return PageView::select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as organic_visits')
            ])
            ->where('created_at', '>=', $startDate)
            ->where(function ($query) {
                $query->where('referer', 'LIKE', '%google.%')
                      ->orWhere('referer', 'LIKE', '%bing.%')
                      ->orWhere('referer', 'LIKE', '%yahoo.%');
            })
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getTopLandingPages($startDate)
    {
        return PageView::select([
                'url',
                'title',
                DB::raw('COUNT(*) as sessions'),
                DB::raw('ROUND(AVG(CASE WHEN is_bounce = 1 THEN 100 ELSE 0 END), 1) as bounce_rate'),
                DB::raw('ROUND(AVG(time_on_page), 0) as avg_session_duration')
            ])
            ->where('created_at', '>=', $startDate)
            ->where(function ($query) {
                $query->where('referer', 'LIKE', '%google.%')
                      ->orWhere('referer', 'LIKE', '%bing.%')
                      ->orWhere('referer', 'LIKE', '%yahoo.%');
            })
            ->groupBy(['url', 'title'])
            ->orderByDesc('sessions')
            ->limit(20)
            ->get();
    }

    private function getCrawlErrors($startDate)
    {
        return SeoError::select([
                'url',
                'status_code',
                'error_type',
                'count',
                'last_seen'
            ])
            ->where('last_seen', '>=', $startDate)
            ->whereIn('status_code', [404, 500, 503])
            ->orderByDesc('count')
            ->limit(50)
            ->get();
    }
    /**
     * Rastrear tiempo en página
     */
    public function trackPageTime(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'time_on_page' => 'required|integer|min:1',
            'session_id' => 'required|string',
        ]);

        // Actualizar el tiempo en la última vista de página de esta sesión
        PageView::where('session_id', $data['session_id'])
            ->where('url', $data['url'])
            ->latest()
            ->first()
            ?->update(['time_on_page' => $data['time_on_page']]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Rastrear errores JavaScript
     */
    public function trackError(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'error_message' => 'required|string',
            'error_file' => 'nullable|string',
            'error_line' => 'nullable|integer',
            'error_column' => 'nullable|integer',
            'session_id' => 'required|string',
        ]);

        SeoError::create([
            'url' => $data['url'],
            'status_code' => 0, // 0 para errores JS
            'error_type' => 'javascript_error',
            'error_message' => $data['error_message'] . 
                (isset($data['error_file']) ? " in {$data['error_file']}" : '') .
                (isset($data['error_line']) ? " at line {$data['error_line']}" : ''),
            'user_agent' => $request->userAgent(),
            'count' => 1,
            'first_seen' => now(),
            'last_seen' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Rastrear clics en enlaces externos
     */
    public function trackExternalLink(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'external_link' => 'required|string',
            'link_text' => 'nullable|string',
            'session_id' => 'required|string',
        ]);

        PageView::create([
            'url' => $data['url'],
            'session_id' => $data['session_id'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'conversion_type' => 'external_link_click',
            'meta_description' => $data['external_link'],
            'title' => $data['link_text'],
            'visited_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Rastrear envíos de formularios
     */
    public function trackFormSubmission(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'form_id' => 'required|string',
            'form_action' => 'nullable|string',
            'session_id' => 'required|string',
        ]);

        PageView::create([
            'url' => $data['url'],
            'session_id' => $data['session_id'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_conversion' => true,
            'conversion_type' => 'form_submission',
            'meta_description' => $data['form_id'],
            'title' => $data['form_action'],
            'visited_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Rastrear profundidad de scroll
     */
    public function trackScrollDepth(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'scroll_depth' => 'required|integer|min:0|max:100',
            'session_id' => 'required|string',
        ]);

        // Solo guardar hitos importantes de scroll
        if (in_array($data['scroll_depth'], [25, 50, 75, 100])) {
            PageView::create([
                'url' => $data['url'],
                'session_id' => $data['session_id'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'conversion_type' => 'scroll_depth',
                'conversion_value' => $data['scroll_depth'],
                'visited_at' => now(),
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Rastrear eventos personalizados
     */
    public function trackEvent(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string',
            'event_name' => 'required|string',
            'event_data' => 'nullable|string',
            'session_id' => 'required|string',
        ]);

        PageView::create([
            'url' => $data['url'],
            'session_id' => $data['session_id'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'conversion_type' => 'custom_event',
            'title' => $data['event_name'],
            'meta_description' => $data['event_data'],
            'visited_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Obtener métricas en tiempo real
     */
    public function getRealTimeMetrics(Request $request)
    {
        $period = $request->get('period', '1h'); // 1h, 24h, 7d
        
        $startDate = match($period) {
            '1h' => Carbon::now()->subHour(),
            '24h' => Carbon::now()->subDay(),
            '7d' => Carbon::now()->subDays(7),
            default => Carbon::now()->subHour()
        };

        return response()->json([
            'current_visitors' => $this->getCurrentVisitors(),
            'page_views_last_hour' => PageView::where('created_at', '>=', Carbon::now()->subHour())->count(),
            'top_pages' => $this->getTopPagesRealTime($startDate),
            'traffic_sources' => $this->getTrafficSources($startDate),
            'device_breakdown' => $this->getDeviceStats($startDate),
            'countries' => $this->getTopCountriesTraffic($startDate),
        ]);
    }

    /**
     * Obtener visitantes actuales (últimos 5 minutos)
     */
    private function getCurrentVisitors()
    {
        return PageView::where('created_at', '>=', Carbon::now()->subMinutes(5))
            ->distinct('session_id')
            ->count('session_id');
    }

    /**
     * Obtener páginas más visitadas en tiempo real
     */
    private function getTopPagesRealTime($startDate)
    {
        return PageView::select([
                'url',
                'title',
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT session_id) as unique_visitors')
            ])
            ->where('created_at', '>=', $startDate)
            ->groupBy(['url', 'title'])
            ->orderByDesc('views')
            ->limit(10)
            ->get();
    }

    /**
     * Exportar datos de analytics
     */
    public function exportData(Request $request)
    {
        $period = $request->get('period', '30d');
        $format = $request->get('format', 'csv'); // csv, json, excel
        $startDate = $this->getStartDate($period);

        $data = PageView::select([
                'url',
                'title',
                'referer',
                'device_type',
                'browser',
                'country',
                'utm_source',
                'utm_medium',
                'utm_campaign',
                'time_on_page',
                'is_bounce',
                'is_conversion',
                'created_at'
            ])
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->get();

        switch ($format) {
            case 'json':
                return response()->json($data);
                
            case 'csv':
                $filename = 'analytics_' . now()->format('Y-m-d') . '.csv';
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => "attachment; filename=\"$filename\"",
                ];

                $callback = function() use ($data) {
                    $file = fopen('php://output', 'w');
                    
                    // Headers
                    fputcsv($file, [
                        'URL', 'Título', 'Referente', 'Dispositivo', 'Navegador',
                        'País', 'UTM Source', 'UTM Medium', 'UTM Campaign',
                        'Tiempo en Página', 'Es Rebote', 'Es Conversión', 'Fecha'
                    ]);

                    // Data
                    foreach ($data as $row) {
                        fputcsv($file, [
                            $row->url,
                            $row->title,
                            $row->referer,
                            $row->device_type,
                            $row->browser,
                            $row->country,
                            $row->utm_source,
                            $row->utm_medium,
                            $row->utm_campaign,
                            $row->time_on_page,
                            $row->is_bounce ? 'Sí' : 'No',
                            $row->is_conversion ? 'Sí' : 'No',
                            $row->created_at->format('Y-m-d H:i:s')
                        ]);
                    }
                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);
                
            default:
                return response()->json(['error' => 'Formato no soportado'], 400);
        }
    }
}