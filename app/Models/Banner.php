<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Manipulations;

class Banner extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'title',
        'subtitle',
        'link',
        'cta',
        'width',
        'height',
        'is_active',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_active' => 'boolean',
        'cta' => 'array',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_active', true)
                    ->where('published_at', '<=', now());
    }
    
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    public function getImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('banners_covers');
        return $media ? $media->getFullUrl() : null;
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('banners_covers')
            ->singleFile()
            ->useDisk('public');
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(368)
            ->height(232)
            ->sharpen(10)
            ->nonQueued();
            
        $this->addMediaConversion('optimized')
            ->width(1200)
            ->height(630)
            ->quality(80)
            ->nonQueued();
    }

    public function getDimensionsAttribute()
    {
        $media = $this->getFirstMedia('banners_covers');
        if ($media) {
            return [
                'width' => $media->getCustomProperty('width'),
                'height' => $media->getCustomProperty('height')
            ];
        }
        return null;
    }
}