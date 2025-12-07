<?php

namespace App\Listeners\Horario;

use App\Models\AbsenceNote;
use Illuminate\Support\Facades\Log;
use App\Traits\GenericNotificationTrait;
use App\Events\Horario\RetrasoDetectado;

class NotificarRetrasoSignificativo
{
    use GenericNotificationTrait;
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
    public function handle(RetrasoDetectado $event): void
    {
        Log::info('Listener ejecutado: NotificarRetrasoSignificativo', [
            'horario_id' => $event->horario->id,
            'minutos_retraso' => $event->minutosRetraso,
        ]);

        try {
            AbsenceNote::create([
                'horario_id' => $event->horario->id,
                'status' => 'pendiente',
                'reason' => "Retraso detectado: {$event->minutosRetraso} minutos",
            ]);

            Log::info('Nota de ausencia creada automáticamente', [
                'horario_id' => $event->horario->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear la nota de ausencia', [
                'error' => $e->getMessage(),
                'horario_id' => $event->horario->id,
            ]);
        }

        // Notificar al manager directo
        $this->sendNotification(
            $event->horario,
            config('notifications.rules.horario.retraso.templates.title'),
            [
                'horario_id' => $event->horario->id,
                'empleado_nombre' => $event->horario->contrato->empleado->nombre,
                'minutos_retraso' => $event->minutosRetraso,
            ]
        );
    }
}
