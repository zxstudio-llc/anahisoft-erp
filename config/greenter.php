<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Greenter Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration will be overridden dynamically for each tenant
    | based on their SUNAT credentials stored in the tenant's settings.
    |
    */

    'certificate' => [
        'sol_user' => env('GREENTER_SOL_USER', ''),
        'sol_pass' => env('GREENTER_SOL_PASS', ''),
        'certificate_path' => env('GREENTER_CERTIFICATE_PATH', ''),
        'certificate_password' => env('GREENTER_CERTIFICATE_PASSWORD', ''),
    ],

    'service' => [
        'endpoint_fe' => env('GREENTER_ENDPOINT_FE', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService'),
        'endpoint_guia' => env('GREENTER_ENDPOINT_GUIA', 'https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-gem-beta/billService'),
        'endpoint_retenciones' => env('GREENTER_ENDPOINT_RETENCIONES', 'https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService'),
    ],

    'company' => [
        'ruc' => env('GREENTER_COMPANY_RUC', ''),
        'razon_social' => env('GREENTER_COMPANY_RAZON_SOCIAL', ''),
        'nombre_comercial' => env('GREENTER_COMPANY_NOMBRE_COMERCIAL', ''),
        'direccion' => env('GREENTER_COMPANY_DIRECCION', ''),
        'ubigeo' => env('GREENTER_COMPANY_UBIGEO', '150101'),
        'distrito' => env('GREENTER_COMPANY_DISTRITO', ''),
        'provincia' => env('GREENTER_COMPANY_PROVINCIA', ''),
        'departamento' => env('GREENTER_COMPANY_DEPARTAMENTO', ''),
        'pais' => env('GREENTER_COMPANY_PAIS', 'PE'),
    ],

    'mode' => env('GREENTER_MODE', 'beta'), // beta or production
];
