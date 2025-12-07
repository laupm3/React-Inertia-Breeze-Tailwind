<?php

namespace App\Events\Empleado;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmployeeStatusChanged
{
    use Dispatchable, SerializesModels;

    /**
     * @param Empleado $empleado El empleado con su NUEVO estado.
     * @param int $originalStatusId El ID del estado ANTERIOR.
     * @param User|null $actor El usuario que realizó el cambio.
     */
    public function __construct(
        public readonly Empleado $empleado,
        public readonly int $originalStatusId,
        public readonly ?User $actor = null
    ) {}
}
