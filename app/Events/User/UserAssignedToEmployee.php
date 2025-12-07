<?php

namespace App\Events\User;

use App\Models\User;
use App\Models\Empleado;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserAssignedToEmployee
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly Empleado $empleado,
        public readonly ?User $actor = null
    ) {}
}
