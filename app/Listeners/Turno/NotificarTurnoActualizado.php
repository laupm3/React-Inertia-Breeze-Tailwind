<?php

namespace App\Listeners\Turno;

use App\Events\Turno\TurnoActualizado;
use App\Traits\TurnoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarTurnoActualizado
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
    public function handle(TurnoActualizado $event): void
    {
        Log::info('🎯 Notificando actualización de turno', [
            'turno_id' => $event->turno->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutTurno($event->turno, 'updated');
        
        // Notificar al empleado y managers
        $this->notifyUsersAboutTurno($event->turno, 'updated');
        
        // Notificar al personal de RH
        $this->notifyHRAboutTurno($event->turno, 'updated');
    }
}
