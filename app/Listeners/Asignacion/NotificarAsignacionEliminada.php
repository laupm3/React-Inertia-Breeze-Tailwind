<?php

namespace App\Listeners\Asignacion;

use App\Events\Asignacion\AsignacionEliminada;
use App\Traits\AsignacionNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarAsignacionEliminada
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
    public function handle(AsignacionEliminada $event): void
    {
        Log::info('🔄 Notificando eliminación de empresa', [
            'empresa_id' => $event->asignacion->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutAsignacion($event->asignacion, 'deleted');
    }
}
