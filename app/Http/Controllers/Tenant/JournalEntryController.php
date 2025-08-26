<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\ChartOfAccount;
use App\Http\Requests\StoreJournalEntryRequest;
use App\Services\Tenant\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function __construct(private AccountingService $accountingService) {}

    public function index()
    {
        $entries = JournalEntry::where('company_id', auth()->user()->company_id)
            ->orderBy('entry_date', 'desc')
            ->paginate(10);

        return Inertia::render('Tenant/JournalEntries/Index', [
            'entries' => $entries
        ]);
    }

    public function create()
    {
        $accounts = ChartOfAccount::where('company_id', auth()->user()->company_id)
            ->where('is_detail', true)
            ->where('active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Tenant/JournalEntries/Create', [
            'accounts' => $accounts
        ]);
    }

    public function store(StoreJournalEntryRequest $request)
    {
        $entry = $this->accountingService->createManualJournalEntry($request->validated());

        return redirect()->route('journal-entries.index')
            ->with('success', 'Journal entry created successfully');
    }

    public function show(JournalEntry $journalEntry)
    {
        $this->authorize('view', $journalEntry);
        
        return Inertia::render('Tenant/JournalEntries/Show', [
            'entry' => $journalEntry->load(['details.account'])
        ]);
    }

    public function post(JournalEntry $journalEntry)
    {
        $this->authorize('update', $journalEntry);
        
        if ($journalEntry->status !== 'draft') {
            return redirect()->route('journal-entries.show', $journalEntry)
                ->with('error', 'Entry is already posted');
        }

        $this->accountingService->postJournalEntry($journalEntry);

        return redirect()->route('journal-entries.show', $journalEntry)
            ->with('success', 'Journal entry posted successfully');
    }
}