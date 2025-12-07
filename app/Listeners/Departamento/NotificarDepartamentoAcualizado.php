<?php

namespace App\Listeners\Departamento;

use Illuminate\Support\Facades\Log;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Traits\DepartamentoNotificacionesTrait;
use App\Events\Departamento\DepartamentoActualizado;

class NotificarDepartamentoAcualizado /* implements ShouldQueue */
{
    use  DepartamentoNotificacionesTrait;
    use InteractsWithQueue;

    /* public $queue = 'notifications'; */
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
    public function handle(DepartamentoActualizado $event): void
    {
        Log::debug('Listener recibiendo evento', [
            'listener' => self::class,
            'event' => get_class($event),
            'departamento_id' => $event->departamento->id,
        ]);
        // Notifiacar a todos los administradores
        $this->notifyAdminsAboutDepartamento($event->departamento, 'updated');

        // Notificar a usuarios asignados
        $this->notifyUsersAboutDepartamento($event->departamento, 'updated');
    }
}

