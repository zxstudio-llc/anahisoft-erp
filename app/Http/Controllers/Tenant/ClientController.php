<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Muestra la lista de clientes
     */
    public function index(Request $request)
    {
        
        return Inertia::render('Tenant/Clients/Index');
    }

    /**
     * Muestra el formulario para crear un cliente
     */
    public function create()
    {
        $documentTypes = [
            ['value' => '01', 'label' => 'DNI'],
            ['value' => '06', 'label' => 'RUC'],
            ['value' => '04', 'label' => 'CE'],
            ['value' => '07', 'label' => 'Pasaporte'],
            ['value' => '00', 'label' => 'No Domiciliado'],
        ];
        
        return Inertia::render('Tenant/Clients/Create', [
            'document_types' => $documentTypes,
        ]);
    }

  

    /**
     * Muestra el formulario para editar un cliente
     */
    public function edit(Client $client)
    {
        $documentTypes = [
            ['value' => '01', 'label' => 'DNI'],
            ['value' => '06', 'label' => 'RUC'],
            ['value' => '04', 'label' => 'CE'],
            ['value' => '07', 'label' => 'Pasaporte'],
            ['value' => '00', 'label' => 'No Domiciliado'],
        ];
        
        return Inertia::render('Tenant/Clients/Edit', [
            'client' => $client,
            'document_types' => $documentTypes,
        ]);
    }

} 