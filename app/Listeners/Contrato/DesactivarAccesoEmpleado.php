<?php

namespace App\Listeners\Contrato;

use App\Events\Contrato\EmpleadoSinContratosVigentes;
use App\Models\Empleado;
use App\Traits\GenericNotificationTrait;
use Illuminate\Support\Facades\Log;

class DesactivarAccesoEmpleado
{
    use GenericNotificationTrait;

    /**
     * Create a new event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EmpleadoSinContratosVigentes $event): void
    {
        Log::info('Listener ejecutado: DesactivarAccesoEmpleado', [
            'empleado_id' => $event->empleadoId,
        ]);

        $empleado = Empleado::findOrFail($event->empleadoId);
        $user = $empleado->user;

        if (!$user) {
            Log::warning('Empleado sin usuario asociado', [
                'empleado_id' => $empleado->id,
            ]);
            return;
        }

        try {
            // Desactivar acceso
            $user->active = false;
            $user->save();

            Log::info('Acceso desactivado para empleado sin contratos vigentes', [
                'empleado_id' => $empleado->id,
                'user_id' => $user->id,
            ]);

            // Notificar al empleado
            $this->sendNotification(
                $empleado->user,
                'Acceso desactivado',
                [
                    'empleado_id' => $empleado->id,
                    'empleado_nombre' => $empleado->nombre,
                ]
            );

            // Notificar a RRHH
            // Usamos el empleado como modelo base para la notificación
            $this->sendNotification(
                $empleado,
                'Empleado sin contratos vigentes',
                [
                    'empleado_id' => $empleado->id,
                    'empleado_nombre' => $empleado->nombre,
                    'roles' => ['Human Resources', 'Administrator'], // Pasamos los roles como parte de la configuración
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error al desactivar acceso de empleado', [
                'error' => $e->getMessage(),
                'empleado_id' => $empleado->id,
            ]);
        }
    }
}
