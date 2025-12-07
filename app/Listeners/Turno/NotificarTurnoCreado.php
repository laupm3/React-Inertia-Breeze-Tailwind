<?php

namespace App\Listeners\Turno;

use App\Events\Turno\TurnoCreado;
use App\Traits\TurnoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarTurnoCreado
{
    use TurnoNotificacionesTrait;

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
    public function handle(TurnoCreado $event): void
    {
        Log::info('🎯 Iniciando notificación de turno creado', [
            'turno_id' => $event->turno->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutTurno($event->turno, 'created');

        // Notificar al empleado y managers
        $this->notifyUsersAboutTurno($event->turno, 'created');

        // Notificar al personal de RH
        $this->notifyHRAboutTurno($event->turno, 'created');
    }
}
