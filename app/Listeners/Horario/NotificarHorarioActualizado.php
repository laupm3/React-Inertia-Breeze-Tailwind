<?php

namespace App\Listeners\Horario;

use App\Events\Horario\HorarioActualizado;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarHorarioActualizado
{
    use GenericNotificationTrait;

    /**
     * Handle the event.
     */
    public function handle(HorarioActualizado $event): void
    {
        Log::info('🎯 Iniciando notificación de horario actualizado', [
            'horario_id' => $event->horario->id
        ]);

        // Notificar a todos los administradores
        $this->sendNotification(
            config('notifications.rules.horario.updated.recipients'),
            config('notifications.rules.horario.updated.templates.title'),
            [
                'horario_id' => $event->horario->id,
                'action' => 'updated',
            ]
        );
    }
}
