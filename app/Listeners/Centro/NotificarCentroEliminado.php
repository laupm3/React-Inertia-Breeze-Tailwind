<?php

namespace App\Listeners\Centro;

use App\Events\Centro\CentroEliminado;
use App\Traits\CentroNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarCentroEliminado
{
    use CentroNotificacionesTrait;

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
    public function handle(CentroEliminado $event): void
    {
        Log::info('🎯 Notificando eliminación de Centro', [
            'centro_id' => $event->centro->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutCentro($event->centro, 'deleted');
        // Notificar a todos los usuarios
        $this->notifyUsersAboutCentro($event->centro, 'deleted');
    }
}
