<?php

use Laravel\Fortify\Fortify;
use Laravel\Jetstream\Jetstream;
use Illuminate\Support\Facades\App;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

Jetstream::ignoreRoutes();
Fortify::ignoreRoutes();

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\RestrictDemoMode::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\RestrictDemoMode::class,
        ]);

        $middleware->alias([
            'check.banned' => \App\Http\Middleware\CheckBannedUser::class,
            'optimize.export' => \App\Http\Middleware\Export\OptimizeExportQueries::class,
            'restrict.demo' => \App\Http\Middleware\RestrictDemoMode::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
