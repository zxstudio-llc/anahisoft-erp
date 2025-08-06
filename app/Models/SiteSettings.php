<?php

namespace App\Models;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Database\Eloquent\Model;

class SiteSettings extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'site_name',
        'primary_color',
        'secondary_color',
        'contact_email',
        'contact_phone',
        'address',
        'meta_description',
        'meta_keywords',
        'site_description',
        'support_email',
        'support_phone',
        'analytics_data',
        'seo_title',
        'seo_keywords',
        'seo_metadata',
        'social_network',
        'seo_description',
    ];

    protected $casts = [
        'social_links' => 'array',
        'analytics_data' => 'array',
        'seo_metadata' => 'array',
        'social_network' => 'array',
    ];

    protected $attributes = [
        'seo_metadata' => '[]',
    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']);
            
        $this
            ->addMediaCollection('favicon')
            ->singleFile()
            ->acceptsMimeTypes(['image/png', 'image/x-icon', 'image/vnd.microsoft.icon']);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this
            ->addMediaConversion('webp')
            ->format('webp')
            ->quality(95)
            ->performOnCollections('logo');
            
        $this
            ->addMediaConversion('ico')
            ->format('ico')
            ->performOnCollections('favicon');
            
        $this
            ->addMediaConversion('optimized')
            ->optimize()
            ->performOnCollections('logo');
    }

    public static function getSettings(): self
    {
        return self::firstOrCreate([], [
            'site_name' => config('app.name'),
            'primary_color' => '#3b82f6',
            'secondary_color' => '#10b981',
        ]);
    }

    // Helpers para acceder fácilmente a los medios
    public function getLogoUrlAttribute()
    {
        return $this->getFirstMediaUrl('logo', 'webp') ?: 
               $this->getFirstMediaUrl('logo');
    }

    public function getFaviconUrlAttribute()
    {
        return $this->getFirstMediaUrl('favicon', 'ico') ?: 
               $this->getFirstMediaUrl('favicon');
    }
}