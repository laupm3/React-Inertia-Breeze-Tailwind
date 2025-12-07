<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\ContratoProximoAVencer;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarContratoProximoAVencer
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
    public function handle(ContratoProximoAVencer $event): void
    {
        Log::info('Listener ejecutado: NotificarContratoProximoAVencer', [
            'contrato_id' => $event->contrato->id,
            'dias_restantes' => $event->diasRestantes,
        ]);

        try {
            // Notificar al empleado
            if ($event->contrato->empleado && $event->contrato->empleado->user) {
                $this->sendNotification(
                    $event->contrato->empleado->user,
                    'Contrato próximo a vencer',
                    [
                        'contrato_id' => $event->contrato->id,
                        'numero_expediente' => $event->contrato->n_expediente,
                        'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                        'dias_restantes' => $event->diasRestantes,
                    ]
                );

                Log::info('Notificación de vencimiento próximo enviada al empleado', [
                    'empleado_id' => $event->contrato->empleado->id,
                    'contrato_id' => $event->contrato->id,
                    'dias_restantes' => $event->diasRestantes,
                ]);
            }

            // Notificar al manager
            if ($event->contrato->empleado && $event->contrato->empleado->manager) {
                $this->sendNotification(
                    $event->contrato->empleado->manager,
                    'Contrato de empleado próximo a vencer',
                    [
                        'contrato_id' => $event->contrato->id,
                        'empleado_nombre' => $event->contrato->empleado->nombre_completo,
                        'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                        'dias_restantes' => $event->diasRestantes,
                    ]
                );

                Log::info('Notificación de vencimiento próximo enviada al manager', [
                    'manager_id' => $event->contrato->empleado->manager->id,
                    'contrato_id' => $event->contrato->id,
                ]);
            }

            // Notificar al panel de contratos
            // Usamos el contrato como modelo base para la notificación
            $this->sendNotification(
                $event->contrato,
                'Contrato próximo a vencer - Panel de contratos',
                [
                    'contrato_id' => $event->contrato->id,
                    'empleado_nombre' => $event->contrato->empleado ? $event->contrato->empleado->nombre_completo : 'N/A',
                    'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                    'dias_restantes' => $event->diasRestantes,
                    'roles' => ['Human Resources', 'Manager'], // Pasamos los roles como parte de la configuración
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error al notificar contrato próximo a vencer', [
                'error' => $e->getMessage(),
                'contrato_id' => $event->contrato->id,
            ]);
        }
    }
}
