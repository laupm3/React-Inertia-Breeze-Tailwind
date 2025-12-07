<?php

namespace App\Listeners\Empresa;

use App\Events\Empresa\EmpresaEliminada;
use App\Traits\EmpresaNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarEmpresaEliminada
{
    use EmpresaNotificacionesTrait;

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
    public function handle(EmpresaEliminada $event): void
    {
        Log::info('🎯 Notificando eliminación de empresa', [
            'empresa_id' => $event->empresa->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutEmpresa($event->empresa, 'deleted');
    }
}
