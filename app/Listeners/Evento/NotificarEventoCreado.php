<?php

namespace App\Listeners\Evento;

use App\Events\Evento\EventoCreado;
use App\Traits\EventoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarEventoCreado
{
    use EventoNotificacionesTrait;

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
    public function handle(EventoCreado $event): void
    {
        // Asegurarnos de que el evento tenga sus relaciones cargadas
        $evento = $event->evento->load('users');
        
        Log::info('🎯 Notificando creación de evento a participantes', [
            'evento_id' => $evento->id,
            'num_participantes' => $evento->users->count()
        ]);

        // Notificar a todos los participantes del evento
        $this->notifyAdminsAboutEvento($evento, 'created');
    }
} 