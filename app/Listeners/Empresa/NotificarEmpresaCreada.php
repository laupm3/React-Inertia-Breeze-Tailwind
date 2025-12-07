<?php

namespace App\Listeners\Empresa;

use App\Events\Empresa\EmpresaCreada;
use App\Traits\EmpresaNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarEmpresaCreada
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
    public function handle(EmpresaCreada $event): void
    {
        Log::info('🎯 Notificando creación de empresa', [
            'empresa_id' => $event->empresa->id
        ]);

        // Notificar a todos los administradores
        $this->notifyAdminsAboutEmpresa($event->empresa, 'created');
    }
}
