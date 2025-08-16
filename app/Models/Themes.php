<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Themes extends Model
{
    protected $casts = [
        'colors' => 'array',
        'styles' => 'array',
        'is_active' => 'boolean'
    ];

    protected $fillable = [
        'name',
        'type',
        'colors',
        'styles',
        'is_active'
    ];

    public static function activate(Theme $theme)
    {
        self::where('type', $theme->type)
            ->where('id', '!=', $theme->id)
            ->update(['is_active' => false]);
        
        $theme->update(['is_active' => true]);
    }

    public static function getActiveTheme($type)
    {
        return self::where('type', $type)
            ->where('is_active', true)
            ->firstOrFail();
    }
}