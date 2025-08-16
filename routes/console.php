<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

// Comando inspire por defecto
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programar el comando de verificación de suscripciones
Artisan::command('schedule:run', function (Schedule $schedule) {
    $schedule->command('subscriptions:check-expirations')
        ->daily()
        ->at('01:00')
        ->appendOutputTo(storage_path('logs/subscriptions.log'));
});
