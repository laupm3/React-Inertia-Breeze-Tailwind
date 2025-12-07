<?php

namespace App\Listeners\Departamento;


use Illuminate\Support\Facades\Log;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Traits\DepartamentoNotificacionesTrait;
use App\Events\Departamento\DepartamentoEliminado;

class NotificarDepartamentoEliminado implements ShouldQueue
{
    use  DepartamentoNotificacionesTrait;
    use InteractsWithQueue;

    public $queue = 'notifications';
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
    public function handle(DepartamentoEliminado $event): void
    {
        Log::info('🎯 Notificando eliminación de departamento', [
            'departamento_id' => $event->departamento->id
        ]);
        // Notificar a todos los administradores
        $this->notifyAdminsAboutDepartamento($event->departamento, 'deleted');

        // Notificar a usuarios asignados
        $this->notifyUsersAboutDepartamento($event->departamento, 'deleted');
    }
}
