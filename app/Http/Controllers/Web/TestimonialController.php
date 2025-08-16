<?php

namespace App\Http\Controllers\Web;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::orderByDesc('created_at')->get();

        return Inertia::render('app/testimonials/index', [
            'testimonials' => $testimonials->map(function ($testimonial) {
                return [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'position' => $testimonial->position,
                    'message' => $testimonial->message,
                    'photo_url' => $testimonial->photo ? Storage::url($testimonial->photo) : null,
                    'is_active' => $testimonial->is_active,
                    'created_at' => $testimonial->created_at->format('d/m/Y H:i'),
                ];
            })
        ]);
    }

    public function create()
    {
        return Inertia::render('app/testimonials/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'nullable|string|max:100',
            'message' => 'required|string|max:500',
            'photo' => 'nullable|image|max:2048|dimensions:max_width=1000,max_height=1000',
            'is_active' => 'required|boolean',
        ]);

        $data['is_active'] = (bool)$request->is_active;

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('testimonials', 'public');
        }

        Testimonial::create($data);

        return redirect()->route('testimonials.index')->with('toast', [
            'type' => 'success',
            'message' => 'Testimonio creado correctamente.'
        ]);
    }

    public function edit(Testimonial $testimonial)
    {
        return Inertia::render('app/testimonials/edit', [
            'testimonial' => [
                'id' => $testimonial->id,
                'name' => $testimonial->name,
                'position' => $testimonial->position,
                'message' => $testimonial->message,
                'photo_url' => $testimonial->photo ? Storage::url($testimonial->photo) : null,
                'is_active' => $testimonial->is_active,
            ]
        ]);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'nullable|string|max:100',
            'message' => 'required|string|max:500',
            'photo' => 'nullable|image|max:2048|dimensions:max_width=1000,max_height=1000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('photo')) {
            if ($testimonial->photo) {
                Storage::disk('public')->delete($testimonial->photo);
            }
            $data['photo'] = $request->file('photo')->store('testimonials', 'public');
        }

        $testimonial->update($data);

        return redirect()->route('testimonials.index')->with('toast', [
            'type' => 'success',
            'message' => 'Testimonio actualizado correctamente.'
        ]);
    }

    public function destroy(Testimonial $testimonial)
    {
        if ($testimonial->photo) {
            Storage::disk('public')->delete($testimonial->photo);
        }

        $testimonial->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Testimonio eliminado correctamente.'
        ]);
    }

    public function toggle(Testimonial $testimonial)
    {
        $testimonial->update(['is_active' => !$testimonial->is_active]);
        
        return back();
    }
}