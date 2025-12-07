<?php

namespace App\Events\Empleado;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando se actualiza la información de un empleado.
 */
class EmployeeUpdated
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Empleado $empleado La instancia del empleado después de la actualización.
     * @param array $originalData Un array con los datos originales del empleado antes del cambio.
     * @param \App\Models\User|null $actor El usuario que realizó la acción.
     */
    public function __construct(
        public readonly Empleado $empleado,
        public readonly array $originalData,
        public readonly ?User $actor = null
    ) {}
}
