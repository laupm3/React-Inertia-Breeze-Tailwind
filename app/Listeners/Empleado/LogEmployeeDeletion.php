<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogEmployeeDeletion implements ShouldQueue
{
    public function handle(EmployeeDeleted $event): void
    {
        Log::channel('audit')->warning('Empleado Eliminado', [
            'empleado_id' => $event->empleadoData['id'],
            'empleado_name' => $event->empleadoData['nombre'] . ' ' . $event->empleadoData['primer_apellido'],
            'actor_id' => $event->actor?->id,
            'actor_name' => $event->actor?->name,
        ]);
    }
}
