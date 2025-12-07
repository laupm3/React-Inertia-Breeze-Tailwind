<?php

namespace App\Listeners\Horario;

use App\Models\AbsenceNote;
use Illuminate\Support\Facades\Log;
use App\Traits\GenericNotificationTrait;
use App\Events\Horario\AusenciaMayorDetectada;

class NotificarAusenciaMayor
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
    public function handle(AusenciaMayorDetectada $event): void
    {
        Log::info('Listener ejecutado: NotificarAusenciaMayor', [
            'horario_id' => $event->horario->id,
            'minutos_retraso' => $event->minutosRetraso,
        ]);

        try {
            AbsenceNote::create([
                'horario_id' => $event->horario->id,
                'status' => 'pendiente',
                'reason' => "Retraso detectado: {$event->minutosRetraso} minutos",
            ]);

            Log::info('Nota de ausencia creada correctamente', [
                'horario_id' => $event->horario->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear la nota de ausencia', [
                'error' => $e->getMessage(),
                'horario_id' => $event->horario->id,
            ]);
        }

        // Notificar al manager directo y al departamento de RRHH
        $this->sendNotification(
            $event->horario,
            config('notifications.rules.horario.ausencia_mayor.templates.title'),
            [
                'horario_id' => $event->horario->id,
                'empleado_nombre' => $event->horario->contrato->empleado->nombre,
                'minutos_retraso' => $event->minutosRetraso,
            ]
        );
    }
}
