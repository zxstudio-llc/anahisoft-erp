<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoreWebVital extends Model
{
    protected $fillable = [
        'url',
        'lcp',
        'fid',
        'cls',
        'fcp',
        'ttfb',
        'device_type'
    ];

    protected $casts = [
        'lcp' => 'decimal:2',
        'fid' => 'decimal:2',
        'cls' => 'decimal:4',
        'fcp' => 'decimal:2',
        'ttfb' => 'decimal:2'
    ];

    public function scopeForDevice($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    public function scopeForPeriod($query, $startDate, $endDate = null)
    {
        $query->where('created_at', '>=', $startDate);
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }
        return $query;
    }

    public function getLcpScoreAttribute()
    {
        if (!$this->lcp) return null;
        return $this->lcp <= 2500 ? 'good' : ($this->lcp <= 4000 ? 'needs_improvement' : 'poor');
    }

    public function getFidScoreAttribute()
    {
        if (!$this->fid) return null;
        return $this->fid <= 100 ? 'good' : ($this->fid <= 300 ? 'needs_improvement' : 'poor');
    }

    public function getClsScoreAttribute()
    {
        if (!$this->cls) return null;
        return $this->cls <= 0.1 ? 'good' : ($this->cls <= 0.25 ? 'needs_improvement' : 'poor');
    }
}