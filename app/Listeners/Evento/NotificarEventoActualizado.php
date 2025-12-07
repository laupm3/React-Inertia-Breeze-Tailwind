<?php

namespace App\Listeners\Evento;

use App\Events\Evento\EventoActualizado;
use App\Traits\EventoNotificacionesTrait;
use Illuminate\Support\Facades\Log;

class NotificarEventoActualizado
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
    public function handle(EventoActualizado $event): void
    {
        // Asegurarnos de que el evento tenga sus relaciones cargadas
        $evento = $event->evento->load('users');
        
        Log::info('🎯 Notificando actualización de evento a participantes', [
            'evento_id' => $evento->id,
            'num_participantes' => $evento->users->count()
        ]);

        // Notificar a todos los participantes del evento
        $this->notifyAdminsAboutEvento($evento, 'updated');
    }
} 