<?php

namespace App\Listeners\Turno;

use App\Events\Turno\TurnoEliminado;
use App\Traits\TurnoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarTurnoEliminado
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
    public function handle(TurnoEliminado $event): void
    {
        Log::info('🎯 Iniciando notificación de turno eliminado', [
            'turno_id' => $event->turno->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutTurno($event->turno, 'deleted');
        
        // Notificar al empleado y managers
        $this->notifyUsersAboutTurno($event->turno, 'deleted');
        
        // Notificar al personal de RH
        $this->notifyHRAboutTurno($event->turno, 'deleted');
    }
}
