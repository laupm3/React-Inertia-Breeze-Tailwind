<?php

namespace App\Listeners\Asignacion;

use App\Events\Asignacion\AsignacionActualizada;
use App\Traits\AsignacionNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarAsignacionActualizada
{
    use AsignacionNotificacionesTrait;

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
    public function handle(AsignacionActualizada $event): void
    {
        Log::info('🎯 Notificando actualización de asignación', [
            'asignacion_id' => $event->asignacion->id
        ]);

        // Notificar a los usuarios relacionados con la asignación
        $this->notifyAdminsAboutAsignacion($event->asignacion, 'updated');
    }
}
