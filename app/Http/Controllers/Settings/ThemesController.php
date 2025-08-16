<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Themes;
use Illuminate\Http\Request;

class ThemesController extends Controller
{
    public function index()
    {
        $themes = Themes::all();
        return inertia('app/settings/themes/index', compact('themes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:web,dashboard',
            'colors' => 'required|array',
            'styles' => 'required|array'
        ]);

        Themes::create($validated);
        return redirect()->route('admin.themes.index');
    }

    public function edit(Themes $theme)
    {
        return inertia('app/settings/themes/edit', compact('theme'));
    }

    public function update(Request $request, Themes $theme)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'colors' => 'required|array',
            'styles' => 'required|array'
        ]);

        $theme->update($validated);
        return redirect()->route('admin.themes.index');
    }

    public function activate(Themes $theme)
    {
        Themes::activate($theme);
        return back();
    }
}
