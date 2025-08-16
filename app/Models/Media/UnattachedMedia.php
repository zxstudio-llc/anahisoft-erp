<?php

namespace App\Models\Media;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media as SpatieMedia;

class UnattachedMedia extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'unattached_media_containers';

    protected $guarded = [];

    public static function getInstance(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }

    public function registerMediaConversions(SpatieMedia $media = null): void
    {
        $this
            ->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10);
        
        $this
            ->addMediaConversion('medium')
            ->width(800)
            ->height(800);
    }
}