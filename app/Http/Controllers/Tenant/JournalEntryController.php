<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class JournalEntryController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/JournalEntries/Index');
    }

    public function create()
    {
        return Inertia::render('Tenant/JournalEntries/Create');
    }

    public function show($id)
    {
        return Inertia::render('Tenant/JournalEntries/Show', [
            'id' => $id
        ]);
    }

    public function edit($id)
    {
        return Inertia::render('Tenant/JournalEntries/Edit', [
            'id' => $id
        ]);
    }
}