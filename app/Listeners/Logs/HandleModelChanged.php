<?php

namespace App\Listeners\Logs;

use App\Events\Logs\ModelChanged;
use App\Jobs\ProcessLogsEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleModelChanged implements ShouldQueue
{
    use InteractsWithQueue;

    public $timeout = 60;
    public $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(ModelChanged $event): void
    {
        // Preparar datos para el job
        $eventData = [
            'event_type' => $event->eventType,
            'model_type' => get_class($event->model),
            'model_id' => $event->model->getKey(),
            'model_data' => $event->modelData,
            'changes' => $event->changes,
            'original' => $event->original,
            'user_id' => $event->userId,
            'ip_address' => $event->ipAddress,
            'user_agent' => $event->userAgent,
        ];

        // Dispatch del job asíncrono
        ProcessLogsEvent::dispatch($eventData);
    }
} 