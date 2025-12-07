<?php

namespace App\Traits;

use App\Events\Logs\ModelChanged;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait HasLogsEvents
{
    /**
     * Boot del trait
     */
    protected static function bootHasLogsEvents()
    {
        static::created(function ($model) {
            static::dispatchLogsEvent('created', $model, null, null, null);
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            $original = $model->getOriginal();
            
            // Filtrar solo los valores originales de los campos que cambiaron
            $originalChanged = array_intersect_key($original, $changes);
            
            static::dispatchLogsEvent('updated', $model, null, $changes, $originalChanged);
        });

        static::deleted(function ($model) {
            static::dispatchLogsEvent('deleted', $model, $model->toArray(), null, null);
        });
    }

    /**
     * Dispatch del evento genérico
     */
    protected static function dispatchLogsEvent(
        string $eventType,
        $model,
        ?array $modelData = null,
        ?array $changes = null,
        ?array $original = null
    ): void {
        $userId = Auth::id();
        $ipAddress = Request::ip();
        $userAgent = Request::userAgent();

        event(new ModelChanged(
            $eventType,
            $model,
            $modelData,
            $changes,
            $original,
            $userId,
            $ipAddress,
            $userAgent
        ));
    }
} 