<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\ContratoCreado;
use App\Traits\ContratoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarContratoCreado
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
    public function handle(ContratoCreado $event): void
    {
        Log::info('🎯 Notificando creación de contrato', [
            'contrato_id' => $event->contrato->id
        ]);

        // Notificar a todos los usuarios relevantes
        $this->notifyAllRelevantUsersAboutContrato($event->contrato, 'created');

        // Programar notificaciones para contratos con fecha de fin
        if ($event->contrato->fecha_fin) {
            $this->programarNotificacionesVencimiento($event->contrato);
        }
    }
}
