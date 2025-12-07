<?php

namespace App\Listeners\Centro;

use App\Events\Centro\CentroActualizado;
use App\Traits\CentroNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarCentroActualizado
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
    public function handle(CentroActualizado $event): void
    {
        Log::info('🎯 Notificando actualización de Centro', [
            'centro_id' => $event->centro->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutCentro($event->centro, 'updated');

        // Notificar a todos los usuarios
        $this->notifyUsersAboutCentro($event->centro, 'updated');
    }
}
