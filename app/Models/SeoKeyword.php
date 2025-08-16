<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoKeyword extends Model
{
    protected $fillable = [
        'keyword',
        'url',
        'position',
        'clicks',
        'impressions',
        'ctr',
        'avg_position',
        'date'
    ];

    protected $casts = [
        'date' => 'date',
        'ctr' => 'decimal:2',
        'avg_position' => 'decimal:2'
    ];

    public function scopeForPeriod($query, $startDate, $endDate = null)
    {
        $query->where('date', '>=', $startDate);
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        return $query;
    }

    public function scopeTopPerformers($query, $limit = 10)
    {
        return $query->orderByDesc('clicks')->limit($limit);
    }
}