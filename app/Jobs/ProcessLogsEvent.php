<?php

namespace App\Jobs;

use App\Events\Logs\ModelChanged;
use App\Models\LogsEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessLogsEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $timeout = 60;
    public $tries = 3;

    protected $eventData;

    /**
     * Create a new job instance.
     */
    public function __construct(array $eventData)
    {
        $this->eventData = $eventData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Guardar el evento en la base de datos
        LogsEvent::create($this->eventData);

        // Aquí puedes agregar lógica adicional como:
        // - Enviar notificaciones
        // - Generar logs
        // - Actualizar estadísticas
        // - Enviar webhooks
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        // Log del error
        Log::error('Error procesando evento logs', [
            'event_data' => $this->eventData,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
} 