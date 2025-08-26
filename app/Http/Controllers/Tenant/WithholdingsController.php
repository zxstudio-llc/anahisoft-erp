<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Withholding;
use App\Models\Tenant\Purchase;
use App\Http\Requests\StoreWithholdingRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WithholdingsController extends Controller
{
    public function index()
    {
        $list = Withholding::with(['purchase.supplier'])
            ->where('company_id', auth()->user()->company_id)
            ->latest()->paginate(10);

        return Inertia::render('Tenant/Withholdings/Index', ['withholdings' => $list]);
    }

    public function create()
    {
        $purchases = Purchase::where('company_id', auth()->user()->company_id)
            ->whereNull('withholding_id')
            ->latest()->take(100)->get(['id','document_number']);

        return Inertia::render('Tenant/Withholdings/Create', ['purchases' => $purchases]);
    }

    public function store(StoreWithholdingRequest $request)
    {
        $data = $request->validated();

        return DB::transaction(function () use ($data) {
            $purchase = Purchase::where('company_id', auth()->user()->company_id)
                ->findOrFail($data['purchase_id']);

            $wh = Withholding::create([
                'company_id' => auth()->user()->company_id,
                'purchase_id' => $purchase->id,
                'issue_date' => $data['issue_date'],
                'establishment_code' => $data['establishment_code'],
                'emission_point' => $data['emission_point'],
                'sequential' => $data['sequential'],
                'income_tax_percent' => $data['income_tax_percent'] ?? 0,
                'vat_percent' => $data['vat_percent'] ?? 0,
                'income_tax_amount' => $data['income_tax_amount'] ?? 0,
                'vat_amount' => $data['vat_amount'] ?? 0,
                'total' => ($data['income_tax_amount'] ?? 0) + ($data['vat_amount'] ?? 0),
                'status' => 'draft',
            ]);

            $purchase->update(['withholding_id' => $wh->id]);

            // Optional: post accounting here if needed

            return redirect()->route('withholdings.show', $wh)->with('success', 'Withholding created');
        });
    }

    public function show(Withholding $withholding)
    {
        $this->authorize('view', $withholding);
        return Inertia::render('Tenant/Withholdings/Show', [ 'withholding' => $withholding->load('purchase.supplier') ]);
    }
}