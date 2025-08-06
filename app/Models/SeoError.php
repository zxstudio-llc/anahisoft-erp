<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoError extends Model
{
    protected $fillable = [
        'url',
        'status_code',
        'error_type',
        'error_message',
        'referer',
        'user_agent',
        'count',
        'first_seen',
        'last_seen'
    ];

    protected $casts = [
        'first_seen' => 'datetime',
        'last_seen' => 'datetime'
    ];

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('last_seen', '>=', now()->subDays($days));
    }

    public function scopeByStatusCode($query, $statusCode)
    {
        return $query->where('status_code', $statusCode);
    }

    public function scopeCriticalErrors($query)
    {
        return $query->whereIn('status_code', [404, 500, 503]);
    }
}
