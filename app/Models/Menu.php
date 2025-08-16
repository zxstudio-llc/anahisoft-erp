<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'title', 
        'description', 
        'location', 
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Obtener todos los items del menú
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('order');
    }

    /**
     * Obtener solo los items raíz (sin padre)
     */
    public function rootItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)
                    ->whereNull('parent_id')
                    ->orderBy('order');
    }

    /**
     * Obtener el menú con su estructura jerárquica completa
     */
    public function getStructuredItems()
    {
        return $this->rootItems()
                    ->with('children')
                    ->get();
    }

    /**
     * Scope para menús activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para obtener menú por ubicación
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }
}