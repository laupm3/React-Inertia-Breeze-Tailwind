<?php

namespace App\Listeners\Permiso;

use Spatie\Permission\Models\Permission;
use App\Events\Permiso\PermisoEliminado;
use App\Traits\PermisoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarPermisoEliminado
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
    public function handle(PermisoEliminado $event): void
    {
        Log::info('🎯 Iniciando notificación de permiso eliminado', [
            'permission_id' => $event->permiso->id,
            'permission_name' => $event->permiso->name
        ]);

        // Notificar al usuario que solicitó el permiso
        $this->notifyUsersAboutPermiso($event->permiso, 'deleted');
    }
}
