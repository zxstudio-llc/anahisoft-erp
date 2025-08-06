<?php

return [
    'paths' => ['*', 'sanctum/csrf-cookie', 'v1/*', 'api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://facturacion.test',
        'https://*.facturacion.test',
        'https://anahisoft.xiaotianqi.com', // Allow all subdomains
    ],

    // ✅ Usa un patrón de expresión regular para permitir subdominios
    'allowed_origins_patterns' => [
        '/^https?:\/\/([a-z0-9-]+\.)*facturacion\.test$/',
        '/^https?:\/\/([a-z0-9-]+\.)*xiaotianqi\.com$/',
        '/^https?:\/\/([a-z0-9-]+\.)*anahisoft.xiaotianqi\.com$/',
        '/^https?:\/\/localhost(:[0-9]+)?$/'
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
