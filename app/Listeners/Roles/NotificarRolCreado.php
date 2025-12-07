<?php

namespace App\Listeners\Roles;

use App\Events\Rol\RolCreado;
use App\Traits\RolNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarRolCreado
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
        Log::info('🎯 Iniciando notificación de rol creado', [
            'role_id' => $event->role->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutRol($event->role, 'created');
    }
}