<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Backlink extends Model
{
    protected $fillable = [
        'source_url',
        'target_url',
        'anchor_text',
        'link_type',
        'domain_authority',
        'page_authority',
        'is_active',
        'first_detected',
        'last_checked'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'first_detected' => 'datetime',
        'last_checked' => 'datetime'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeHighAuthority($query, $minAuthority = 50)
    {
        return $query->where('domain_authority', '>=', $minAuthority);
    }

    public function scopeDofollow($query)
    {
        return $query->where('link_type', 'dofollow');
    }

    public function scopeNofollow($query)
    {
        return $query->where('link_type', 'nofollow');
    }

    public function getSourceDomainAttribute()
    {
        return parse_url($this->source_url, PHP_URL_HOST);
    }
}