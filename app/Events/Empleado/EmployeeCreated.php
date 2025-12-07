<?php

namespace App\Events\Empleado;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando un nuevo empleado es creado en el sistema.
 */
class EmployeeCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Empleado $empleado El empleado que acaba de ser creado.
     * @param \App\Models\User|null $actor El usuario que realizó la acción (si aplica).
     */
    public function __construct(
        public readonly Empleado $empleado,
        public readonly ?User $actor = null
    ) {}
}
