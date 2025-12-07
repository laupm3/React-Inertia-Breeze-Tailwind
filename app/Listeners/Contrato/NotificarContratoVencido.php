<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\ContratoVencido;
use App\Events\Contrato\EmpleadoSinContratosVigentes;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class NotificarContratoVencido
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
    public function handle(ContratoVencido $event): void
    {
        Log::info('Listener ejecutado: NotificarContratoVencido', [
            'contrato_id' => $event->contrato->id,
        ]);

        try {
            // Notificar al empleado
            if ($event->contrato->empleado && $event->contrato->empleado->user) {
                $this->sendNotification(
                    $event->contrato->empleado->user,
                    'Contrato Finalizado',
                    [
                        'contrato_id' => $event->contrato->id,
                        'empleado_id' => $event->contrato->empleado->id,
                        'empleado_nombre' => $event->contrato->empleado->nombre_completo,
                        'contrato_tipo' => $event->contrato->tipoContrato->clave ?? 'N/A',
                        'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                        'action_type' => 'finalizado',
                    ]
                );

                Log::info('Notificación de vencimiento enviada al empleado', [
                    'empleado_id' => $event->contrato->empleado->id,
                    'contrato_id' => $event->contrato->id,
                ]);
            }

            // Notificar al manager
            if ($event->contrato->empleado && $event->contrato->empleado->manager) {
                $this->sendNotification(
                    $event->contrato->empleado->manager,
                    'Contrato de empleado vencido',
                    [
                        'contrato_id' => $event->contrato->id,
                        'empleado_nombre' => $event->contrato->empleado->nombre_completo,
                        'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                    ]
                );

                Log::info('Notificación de vencimiento enviada al manager', [
                    'manager_id' => $event->contrato->empleado->manager->id,
                    'contrato_id' => $event->contrato->id,
                ]);
            }

            // Notificar al panel de contratos
            // Usamos el contrato como modelo base para la notificación
            $this->sendNotification(
                $event->contrato,
                'Contrato vencido - Panel de contratos',
                [
                    'contrato_id' => $event->contrato->id,
                    'empleado_nombre' => $event->contrato->empleado ? $event->contrato->empleado->nombre_completo : 'N/A',
                    'fecha_fin' => $event->contrato->fecha_fin->format('d/m/Y'),
                    'roles' => ['Human Resources', 'Manager'], // Pasamos los roles como parte de la configuración
                ]
            );

            // Comprobar si el empleado tiene otros contratos vigentes
            if ($event->contrato->empleado) {
                $tieneCotratosVigentes = $event->contrato->empleado->contratos()
                    ->where(function($query) {
                        $query->where('fecha_fin', '>=', now())
                            ->orWhereNull('fecha_fin');
                    })
                    ->where('id', '!=', $event->contrato->id)
                    ->exists();

                if (!$tieneCotratosVigentes) {
                    event(new EmpleadoSinContratosVigentes($event->contrato->empleado->id));
                }
            }
        } catch (\Exception $e) {
            Log::error('Error al notificar vencimiento de contrato', [
                'error' => $e->getMessage(),
                'contrato_id' => $event->contrato->id,
            ]);
        }
    }
}
