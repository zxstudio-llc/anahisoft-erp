<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Footer extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean'
    ];

    protected $fillable = [
        'name',
        'template',
        'content',
        'is_active'
    ];

    protected $appends = ['logo_url'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('footer_logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/svg+xml']);
            
        $this->addMediaCollection('footer_brands')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/svg+xml']); 
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10);
    }

    public function getLogoUrlAttribute()
    {
        return $this->getFirstMediaUrl('footer_logo');
    }
}