<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'apiperu' => [
        'token' => env('APIPERU_TOKEN'),
        'url' => env('APIPERU_URL', 'https://apiperu.dev/api'),
    ],

    'mercadopago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
    ],

    'culqi' => [
        'public_key' => env('CULQI_PUBLIC_KEY'),
        'private_key' => env('CULQI_PRIVATE_KEY'),
        'return_url' => env('APP_URL') . '/payment/success',
    ],

    'apis_peru' => [
        'token' => env('APIS_PERU_TOKEN'),
        'base_url' => env('APIS_PERU_BASE_URL', 'https://dniruc.apisperu.com/api/v1'),
    ],

    'datafast' => [
        'base_url' => env('DATAFAST_BASE_URL'),
        'merchant_id' => env('DATAFAST_MERCHANT_ID'),
        'public_key' => env('DATAFAST_PUBLIC_KEY'),
        'private_key' => env('DATAFAST_PRIVATE_KEY'),
    ],

    'payphone' => [
        'token' => env('PAYPHONE_TOKEN'),
        'private_key' => env('PAYPHONE_PRIVATE_KEY'),
        'public_key' => env('PAYPHONE_PUBLIC_KEY'),
        'client_id' => env('PAYPHONE_CLIENT_ID'),
        'client_secret' => env('PAYPHONE_CLIENT_SECRET'),
        'webhook_secret' => env('PAYPHONE_WEBHOOK_SECRET'),
    ],
];
