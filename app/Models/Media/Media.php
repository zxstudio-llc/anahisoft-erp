<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Stevebauman\Location\Facades\Location;
use GuzzleHttp\Client;
use GuzzleHttp\TransferStats;

class Media extends BaseMedia
{
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'model_type',
        'model_id',
        'uuid',
        'collection_name',
        'name',
        'file_name',
        'mime_type',
        'disk',
        'conversions_disk',
        'size',
        'manipulations',
        'custom_properties',
        'generated_conversions',
        'responsive_images',
        'order_column',
        'delete_at'
    ];

    protected $casts = [
        'manipulations' => 'array',
        'custom_properties' => 'array',
        'generated_conversions' => 'array',
        'responsive_images' => 'array',
    ];

    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('media')
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                'created' => 'Media uploaded',
                'updated' => 'Media updated',
                'deleted' => 'Media moved to trash',
                'restored' => 'Media restored from trash',
                'forceDeleted' => 'Media permanently deleted',
                default => "Media {$eventName}",
            });
    }

    protected function getRequestTimingData($url)
    {
        $timingData = [
            'initial_url' => $url,
            'start_time' => microtime(true),
            'effective_url' => $url,
            'media_uuid' => $this->uuid,
            'redirect_count' => null,
            'name_lookup_time' => null,
            'connect_time' => null,
            'pre_transfer_time' => null,
            'start_transfer_time' => null,
            'app_connect_time' => null,
            'redirect_time' => null,
            'total_time' => null,
            'response_code' => null,
            'return_keyword' => 'not_attempted'
        ];

        try {
            $client = new Client([
                'timeout' => 30,
                'connect_timeout' => 10,
                'verify' => config('app.env') === 'production'
            ]);

            $response = $client->request('GET', $url, [
                'on_stats' => function (TransferStats $stats) use (&$timingData) {
                    $timingData = array_merge($timingData, [
                        'effective_url' => (string) $stats->getEffectiveUri(),
                        'redirect_count' => $stats->getHandlerStat('redirect_count') ?? 0,
                        'name_lookup_time' => $stats->getHandlerStat('namelookup_time') ?? 0,
                        'connect_time' => $stats->getHandlerStat('connect_time') ?? 0,
                        'pre_transfer_time' => $stats->getHandlerStat('pretransfer_time') ?? 0,
                        'start_transfer_time' => $stats->getHandlerStat('starttransfer_time') ?? 0,
                        'app_connect_time' => $stats->getHandlerStat('appconnect_time') ?? 0,
                        'redirect_time' => $stats->getHandlerStat('redirect_time') ?? 0,
                        'total_time' => $stats->getTransferTime(),
                        'response_code' => $stats->getResponse()->getStatusCode(),
                        'return_keyword' => $stats->getResponse()->getReasonPhrase(),
                        'end_time' => microtime(true),
                        'calculated_total_time' => microtime(true) - $timingData['start_time']
                    ]);

                    $host = parse_url((string) $stats->getEffectiveUri(), PHP_URL_HOST);
                    if ($host && filter_var($host, FILTER_VALIDATE_DOMAIN)) {
                        $ips = @dns_get_record($host, DNS_A);
                        if ($ips !== false) {
                            $timingData['resolved_ips'] = array_column($ips, 'ip');
                        }
                    }
                }
            ]);

        } catch (\Exception $e) {
            $timingData = array_merge($timingData, [
                'error' => $e->getMessage(),
                'end_time' => microtime(true),
                'calculated_total_time' => microtime(true) - $timingData['start_time'],
                'return_keyword' => 'error: ' . $e->getMessage()
            ]);
        }

        return $timingData;
    }

    public function tapActivity(Activity $activity, string $eventName)
    {
        $request = request();
        $startTime = defined('LARAVEL_START') ? LARAVEL_START : $request->server('REQUEST_TIME_FLOAT');

        $activity->batch_uuid = (string) \Str::uuid();
        $activity->ip_address = $request->ip();
        $activity->user_agent = $request->userAgent();
        $activity->url = $request->fullUrl();
        $activity->method = $request->method();

        $user = auth()->user();
        $activity->causer_type = $user ? get_class($user) : null;
        $activity->causer_id = $user ? $user->id : null;

        // Obtener datos de timing (externos o locales)
        $timingData = $this->custom_properties['timing_details'] ?? $this->getBasicTimingData($startTime);

        // Si es un media externo, usar los resolved_ips ya capturados
        $resolvedIps = $this->custom_properties['resolved_ips'] ?? [];

        // Para medios locales, intentar resolver IPs si es una URL
        if (empty($resolvedIps) && $request->fullUrl()) {
            $host = parse_url($request->fullUrl(), PHP_URL_HOST);
            if ($host && filter_var($host, FILTER_VALIDATE_DOMAIN)) {
                $ips = @dns_get_record($host, DNS_A);
                if ($ips !== false) {
                    $resolvedIps = array_column($ips, 'ip');
                }
            }
        }

        $activity->properties = $activity->properties->merge([
            'resolved_ips' => array_filter($resolvedIps),
            'timing' => $timingData,
            'server' => [
                'hostname' => gethostname(),
                'ip' => $request->server('SERVER_ADDR'),
            ],
            'location' => $this->getLocationData($request->ip()),
            // 'device' => $this->parseUserAgent($request->userAgent()),
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')
            ] : null,
            'is_external' => isset($this->custom_properties['timing_details'])
        ]);
    }

    protected function getBasicTimingData($startTime)
    {
        return [
            'initial_url' => request()->fullUrl(),
            'start_time' => $startTime,
            'effective_url' => request()->fullUrl(),
            'media_uuid' => $this->uuid,
            'redirect_count' => 0,
            'name_lookup_time' => 0,
            'connect_time' => 0,
            'pre_transfer_time' => 0,
            'start_transfer_time' => 0,
            'app_connect_time' => 0,
            'redirect_time' => 0,
            'total_time' => microtime(true) - $startTime,
            'response_code' => http_response_code(),
            'return_keyword' => http_response_code() === 200 ? 'success' : 'error',
            'end_time' => microtime(true),
            'is_local' => true
        ];
    }

    protected function getLocationData($ip)
    {
        if ($ip === '127.0.0.1') {
            return ['city' => 'Localhost', 'country' => 'Local'];
        }

        try {
            return \Location::get($ip)->toArray();
        } catch (\Exception $e) {
            return null;
        }
    }

    // protected function parseUserAgent($userAgent)
    // {
    //     $parser = new \WhichBrowser\Parser($userAgent);

    //     return [
    //         'browser' => $parser->browser->toString(),
    //         'os' => $parser->os->toString(),
    //         'device' => $parser->device->toString(),
    //         'type' => $parser->device->type
    //     ];
    // }
}
