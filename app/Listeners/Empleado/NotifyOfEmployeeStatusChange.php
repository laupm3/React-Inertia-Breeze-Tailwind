<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeStatusChanged;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOfEmployeeStatusChange implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(EmployeeStatusChanged $event): void
    {
        // Usamos vuestro sistema de notificaciones genérico
        $this->sendNotification($event->empleado, 'employee_status_changed', [
            'new_status' => $event->empleado->estadoEmpleado->nombre
        ]);
    }
}
