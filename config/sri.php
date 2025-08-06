<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SRI Service Configuration
    |--------------------------------------------------------------------------
    */

    'timeout' => env('SRI_TIMEOUT', 30),
    'cache_hours' => env('SRI_CACHE_HOURS', 1),
    'scraping_enabled' => env('SRI_SCRAPING_ENABLED', true),
    
    /*
    |--------------------------------------------------------------------------
    | SRI API Endpoints
    |--------------------------------------------------------------------------
    */
    
    'endpoints' => [
        'deudas' => 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/{identificacion}',
        'ruc_page' => 'https://srienlinea.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos2.jspa?ruc={ruc}',
        'alternative_apis' => [
            'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/ruc/{ruc}',
            'https://srienlinea.sri.gob.ec/api/v1.0/contribuyente/{ruc}',
        ]
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Scraping Configuration
    |--------------------------------------------------------------------------
    */
    
    'scraping' => [
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'max_retries' => 3,
        'retry_delay' => 1000, // milliseconds
    ]
];