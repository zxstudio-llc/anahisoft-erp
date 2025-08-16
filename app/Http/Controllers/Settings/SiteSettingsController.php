<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SiteSettingsController extends Controller
{
    public function edit()
    {
        $settings = SiteSettings::getSettings();
        
        return inertia('app/settings/settings/edit', [
            'settings' => array_merge($settings->toArray(), [
                'logo_url' => $settings->logo_url,
                'favicon_url' => $settings->favicon_url
            ])
        ]);
    }

    public function update(Request $request)
    {
        $settings = SiteSettings::getSettings();

        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'primary_color' => 'required|string|size:7',
            'secondary_color' => 'required|string|size:7',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'support_email' => 'nullable|email',
            'support_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'site_description' => 'nullable|string',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_keywords' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'social_links' => 'required|array',
            'social_links.*.platform' => 'required|string',
            'social_links.*.url' => 'required|url',
            'social_network' => 'nullable|array',
            'analytics_data' => 'nullable|array',
            'seo_metadata' => 'nullable|array',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'favicon' => 'nullable|image|mimes:png,ico|max:1024',
        ]);

        // Manejar el logo
        if ($request->hasFile('logo')) {
            $settings
                ->addMediaFromRequest('logo')
                ->withResponsiveImages()
                ->usingFileName(Str::uuid().'.webp')
                ->toMediaCollection('logo');
        }

        // Manejar el favicon
        if ($request->hasFile('favicon')) {
            $settings
                ->addMediaFromRequest('favicon')
                ->toMediaCollection('favicon');
        }

        // Convertir social_links si viene como string
        if (is_string($validated['social_links'])) {
            $validated['social_links'] = json_decode($validated['social_links'], true);
        }

        $settings->update($validated);

        return redirect()->back()->with('success', 'Configuraciones actualizadas correctamente');
    }
}