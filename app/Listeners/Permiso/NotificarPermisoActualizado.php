<?php

namespace App\Listeners\Permiso;

use App\Events\Permiso\PermisoActualizado;
use App\Traits\PermisoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarPermisoActualizado
{
    use PermisoNotificacionesTrait;

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
    public function handle(PermisoActualizado $event): void
    {
        Log::info('🎯 Iniciando notificación de permiso actualizado', [
            'permission_id' => $event->permiso->id,
            'permission_name' => $event->permiso->name
        ]);

        // Notificar a todos los usuarios relevantes
        $this->notifyUsersAboutPermiso($event->permiso, 'updated');
    }
}
