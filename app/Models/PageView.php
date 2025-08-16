<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class PageView extends Model
{
    protected $fillable = [
        'url',
        'title',
        'referer',
        'user_agent',
        'meta_description',
        'meta_keywords',
        'time_on_page',
        'is_bounce',
        'exit_page',
        'device_type',
        'browser',
        'os',
        'screen_resolution',
        'country',
        'city',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'is_conversion',
        'conversion_type',
        'conversion_value',
        'session_id',
        'is_new_visitor',
        'visited_at',
        'ip_address'
    ];

    protected $casts = [
        'meta_keywords' => 'array',
        'is_bounce' => 'boolean',
        'is_conversion' => 'boolean',
        'is_new_visitor' => 'boolean',
        'conversion_value' => 'decimal:2',
        'visited_at' => 'datetime'
    ];

    // Scopes para filtros comunes
    public function scopeForPeriod(Builder $query, $startDate, $endDate = null): Builder
    {
        $query->where('created_at', '>=', $startDate);
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }
        return $query;
    }

    public function scopeForUrl(Builder $query, string $url): Builder
    {
        return $query->where('url', $url);
    }

    public function scopeForDevice(Builder $query, string $deviceType): Builder
    {
        return $query->where('device_type', $deviceType);
    }

    public function scopeOrganicTraffic(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('referer', 'LIKE', '%google.%')
              ->orWhere('referer', 'LIKE', '%bing.%')
              ->orWhere('referer', 'LIKE', '%yahoo.%')
              ->orWhere('referer', 'LIKE', '%duckduckgo.%');
        });
    }

    public function scopeDirectTraffic(Builder $query): Builder
    {
        return $query->whereNull('referer')->orWhere('referer', '');
    }

    public function scopeSocialTraffic(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('referer', 'LIKE', '%facebook.%')
              ->orWhere('referer', 'LIKE', '%instagram.%')
              ->orWhere('referer', 'LIKE', '%twitter.%')
              ->orWhere('referer', 'LIKE', '%linkedin.%')
              ->orWhere('referer', 'LIKE', '%youtube.%')
              ->orWhere('referer', 'LIKE', '%tiktok.%');
        });
    }

    public function scopeConversions(Builder $query): Builder
    {
        return $query->where('is_conversion', true);
    }

    public function scopeBounces(Builder $query): Builder
    {
        return $query->where('is_bounce', true);
    }

    public function scopeNewVisitors(Builder $query): Builder
    {
        return $query->where('is_new_visitor', true);
    }

    // Accessor para obtener el dominio del referer
    public function getRefererDomainAttribute(): ?string
    {
        if (!$this->referer) return null;
        return parse_url($this->referer, PHP_URL_HOST);
    }

    // Accessor para formatear el tiempo en página
    public function getFormattedTimeOnPageAttribute(): string
    {
        if ($this->time_on_page < 60) {
            return $this->time_on_page . 's';
        }
        
        $minutes = floor($this->time_on_page / 60);
        $seconds = $this->time_on_page % 60;
        
        return $minutes . 'm ' . $seconds . 's';
    }

    // Métodos estáticos para métricas rápidas
    public static function getTotalViews($startDate = null): int
    {
        $query = static::query();
        if ($startDate) {
            $query->forPeriod($startDate);
        }
        return $query->count();
    }

    public static function getUniqueVisitors($startDate = null): int
    {
        $query = static::query();
        if ($startDate) {
            $query->forPeriod($startDate);
        }
        return $query->distinct('session_id')->count('session_id');
    }

    public static function getBounceRate($startDate = null): float
    {
        $query = static::query();
        if ($startDate) {
            $query->forPeriod($startDate);
        }
        
        $total = $query->count();
        if ($total === 0) return 0;
        
        $bounces = $query->bounces()->count();
        return round(($bounces / $total) * 100, 2);
    }

    public static function getAverageTimeOnPage($startDate = null): float
    {
        $query = static::query();
        if ($startDate) {
            $query->forPeriod($startDate);
        }
        
        return $query->avg('time_on_page') ?? 0;
    }

    public static function getConversionRate($startDate = null): float
    {
        $query = static::query();
        if ($startDate) {
            $query->forPeriod($startDate);
        }
        
        $total = $query->count();
        if ($total === 0) return 0;
        
        $conversions = $query->conversions()->count();
        return round(($conversions / $total) * 100, 2);
    }
}