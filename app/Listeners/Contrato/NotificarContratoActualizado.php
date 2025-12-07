<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\ContratoActualizado;
use App\Traits\ContratoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarContratoActualizado
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
    public function handle(ContratoActualizado $event): void
    {
        Log::info('🎯 Notificando actualización de contrato', [
            'contrato_id' => $event->contrato->id
        ]);

        // Cancelar notificaciones programadas anteriores
        $this->cancelarNotificacionesVencimiento($event->contrato);

        // Notificar a todos los usuarios relevantes
        $this->notifyAllRelevantUsersAboutContrato($event->contrato, 'updated');

        // Programar nuevas notificaciones para contratos con fecha de fin
        if ($event->contrato->fecha_fin) {
            $this->programarNotificacionesVencimiento($event->contrato);
        }
    }
}
