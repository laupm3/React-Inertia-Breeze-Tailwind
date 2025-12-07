<?php

namespace App\Listeners\Horario;

use App\Events\Horario\HorarioCreado;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarHorarioCreado
{
    use GenericNotificationTrait;

    /**
     * Handle the event.
     */
    public function handle(HorarioCreado $event): void
    {
        Log::info('🎯 Iniciando notificación de horario creado', [
            'horario_id' => $event->horario->id
        ]);

        // Notificar a todos los administradores
        $this->sendNotification(
            config('notifications.rules.horario.created.recipients'),
            config('notifications.rules.horario.created.templates.title'),
            [
                'horario_id' => $event->horario->id,
                'action' => 'created',
            ]
        );
    }
}
