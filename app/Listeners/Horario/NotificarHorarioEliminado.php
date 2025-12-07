<?php

namespace App\Listeners\Horario;

use App\Events\Horario\HorarioEliminado;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarHorarioEliminado
{
    use GenericNotificationTrait;

    /**
     * Handle the event.
     */
    public function handle(HorarioEliminado $event): void
    {
        Log::info('🎯 Iniciando notificación de horario eliminado', [
            'horario_id' => $event->horario->id
        ]);

        // Notificar a todos los administradores
        $this->sendNotification(
            config('notifications.rules.horario.deleted.recipients'),
            config('notifications.rules.horario.deleted.templates.title'),
            [
                'horario_id' => $event->horario->id,
                'action' => 'deleted',
            ]
        );
    }
}
