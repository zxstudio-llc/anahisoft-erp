<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ChartOfAccountsController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/ChartOfAccounts/Index');
    }

    public function create()
    {
        return Inertia::render('Tenant/ChartOfAccounts/Create');
    }

    public function edit($id)
    {
        return Inertia::render('Tenant/ChartOfAccounts/Edit', [
            'id' => $id
        ]);
    }
}
 