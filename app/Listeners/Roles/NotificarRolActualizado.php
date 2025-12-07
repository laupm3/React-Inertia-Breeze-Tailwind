<?php

namespace App\Listeners\Roles;

use App\Events\Rol\RolActualizado;
use App\Traits\RolNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarRolActualizado
{
    use RolNotificacionesTrait;
  
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
    public function handle(object $event): void
    {
        Log::info('🎯 Iniciando notificación de rol actualizado', [
            'role_id' => $event->role->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutRol($event->role, 'updated');
    }
}
