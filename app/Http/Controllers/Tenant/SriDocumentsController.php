<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SriDocument;
use App\Services\Tenant\SrisService;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SriDocumentsController extends Controller
{
    public function __construct(private SrisService $sri) {}

    public function index()
    {
        $docs = SriDocument::with('documentable')
            ->where('company_id', auth()->user()->company_id)
            ->latest()->paginate(15);
        return Inertia::render('Tenant/Sri/Index', ['documents' => $docs]);
    }

    public function show(SriDocument $sriDocument)
    {
        $this->authorize('view', $sriDocument);
        return Inertia::render('Tenant/Sri/Show', ['document' => $sriDocument->load('documentable')]);
    }

    public function resend(SriDocument $sriDocument)
    {
        $this->authorize('update', $sriDocument);
        $this->sri->resend($sriDocument);
        return back()->with('success', 'Document resent to SRI');
    }

    public function downloadXml(SriDocument $sriDocument)
    {
        $this->authorize('view', $sriDocument);
        return response($sriDocument->signed_xml, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => 'attachment; filename="'.$sriDocument->access_key.'.xml"'
        ]);
    }

    public function downloadRide(SriDocument $sriDocument)
    {
        $this->authorize('view', $sriDocument);
        // If you render and store a PDF, return it here. Otherwise stub:
        abort_unless($sriDocument->ride_path, 404);
        return Storage::disk('s3')->download($sriDocument->ride_path);
    }
}
