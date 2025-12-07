<?php

namespace App\Listeners\Asignacion;

use App\Events\Asignacion\AsignacionCreada;
use App\Traits\AsignacionNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarAsignacionCreada
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
    public function handle(AsignacionCreada $event): void
    {
        Log::info('🎯 Notificando creación de empresa', [
            'empresa_id' => $event->asignacion->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutAsignacion($event->asignacion, 'created');
    }
}
