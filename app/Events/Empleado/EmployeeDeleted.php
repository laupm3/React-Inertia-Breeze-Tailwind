<?php

namespace App\Events\Empleado;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando un empleado es eliminado del sistema.
 */
class EmployeeDeleted
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param array $empleadoData Los datos del empleado que fue eliminado.
     * @param \App\Models\User|null $actor El usuario que realizó la acción.
     */
    public function __construct(
        public readonly array $empleadoData,
        public readonly ?User $actor = null
    ) {}
}
