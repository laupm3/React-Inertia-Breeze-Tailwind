<?php

namespace App\Listeners\User;

use App\Events\User\UserAssignedToEmployee;
use Illuminate\Support\Facades\Log;

class LogUserAssignment
{
    public function handle(UserAssignedToEmployee $event): void
    {
        Log::channel('audit')->info('Usuario Asignado a Empleado', [
            'user_id' => $event->user->id,
            'user_name' => $event->user->name,
            'empleado_id' => $event->empleado->id,
            'empleado_name' => $event->empleado->full_name,
            'actor_id' => $event->actor?->id,
        ]);
    }
}
