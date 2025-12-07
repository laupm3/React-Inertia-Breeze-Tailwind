<?php

namespace App\Listeners\Departamento;


use Illuminate\Support\Facades\Log;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Events\Departamento\DepartamentoCreado;
use App\Traits\DepartamentoNotificacionesTrait;

class NotificarDepartamentoCreado implements ShouldQueue
{
    use  DepartamentoNotificacionesTrait;
    use InteractsWithQueue;

    public $queue = 'notifications';
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(DepartamentoCreado $event): void
    {
        Log::info('🎯 Notificando creación de departamento', [
            'departamento_id' => $event->departamento->id
        ]);

        try {
            // Primero, asegurar que las relaciones están cargadas
            $event->departamento->load(['manager.user', 'adjunto.user']);

            // Notificar específicamente al manager y adjunto
            $this->notifyManagerAndAdjunto($event->departamento, 'created');

            // Notificar a administradores (opcional)
            $this->notifyAdminsAboutDepartamento($event->departamento, 'created');

            Log::info('✅ Notificaciones de departamento enviadas correctamente');
        } catch (\Exception $e) {
            Log::error('❌ Error al notificar departamento creado', [
                'error' => $e->getMessage(),
                'departamento_id' => $event->departamento->id
            ]);
        }
    }
}
