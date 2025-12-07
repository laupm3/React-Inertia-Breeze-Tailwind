<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\ContratoEliminado;
use App\Traits\ContratoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarContratoEliminado
{
    use ContratoNotificacionesTrait;

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
    public function handle(ContratoEliminado $event): void
    {
        Log::info('🎯 Notificando eliminación de contrato', [
            'contrato_id' => $event->contrato->id
        ]);

        // Cancelar notificaciones programadas
        $this->cancelarNotificacionesVencimiento($event->contrato);

        // Notificar a todos los usuarios relevantes
        $this->notifyAllRelevantUsersAboutContrato($event->contrato, 'deleted');
    }
}
