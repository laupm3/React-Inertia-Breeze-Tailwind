<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogEmployeeCreation implements ShouldQueue
{
    public function handle(EmployeeCreated $event): void
    {
        Log::channel('audit')->info('Empleado Creado', [
            'empleado_id' => $event->empleado->id,
            'empleado_name' => $event->empleado->getFullNameAttribute(),
            'actor_id' => $event->actor?->id,
            'actor_name' => $event->actor?->name,
        ]);
    }
}
