<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeStatusChanged;
use App\Models\EstadoEmpleado;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogEmployeeStatusChange implements ShouldQueue
{
    public function handle(EmployeeStatusChanged $event): void
    {
        $originalStatus = EstadoEmpleado::find($event->originalStatusId);

        Log::channel('audit')->info('Estado de Empleado Actualizado', [
            'empleado_id' => $event->empleado->id,
            'empleado_name' => $event->empleado->getFullNameAttribute(),
            'original_status' => $originalStatus?->nombre,
            'new_status' => $event->empleado->estadoEmpleado->nombre,
            'actor_id' => $event->actor?->id,
            'actor_name' => $event->actor?->name,
        ]);
    }
}
