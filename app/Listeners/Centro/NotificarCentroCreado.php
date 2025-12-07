<?php

namespace App\Listeners\Centro;

use App\Events\Centro\CentroCreado;
use App\Traits\CentroNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarCentroCreado
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
    public function handle(CentroCreado $event): void
    {
        Log::info('🎯 Notificando creación de Centro', [
            'centro_id' => $event->centro->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutCentro($event->centro, 'created');

        // Notificar a todos los usuarios
        $this->notifyUsersAboutCentro($event->centro, 'created');
    }
}
