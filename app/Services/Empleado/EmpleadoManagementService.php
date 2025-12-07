<?php

namespace App\Services\Empleado;

use App\Events\Empleado\EmployeeCreated;
use App\Events\Empleado\EmployeeUpdated;
use App\Events\Empleado\EmployeeDeleted;
use App\Events\Empleado\EmployeeStatusChanged;
use App\Models\Direccion;
use App\Models\Empleado;
use App\Models\EstadoEmpleado;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class EmpleadoManagementService
{
    public function __construct(
        protected EmpleadoUserService $empleadoUserService
    ) {}

    public function createEmpleado(array $validatedData, ?User $actor = null): Empleado
    {
        return DB::transaction(function () use ($validatedData, $actor) {
            $direccion = Direccion::create($validatedData['direccion']);

            $empleadoData = [
                ...Arr::except($validatedData, ['direccion', 'user_id', 'create_user']),
                'direccion_id' => $direccion->id
            ];

            $empleado = Empleado::create($empleadoData);

            $this->empleadoUserService->handleUserForEmpleado($empleado, $validatedData, $actor);

            event(new EmployeeCreated($empleado, $actor));

            return $empleado;
        });
    }

    public function updateEmpleado(Empleado $empleado, array $validatedData, ?User $actor = null): Empleado
    {
        return DB::transaction(function () use ($empleado, $validatedData, $actor) {
            if (isset($validatedData['direccion'])) {
                $empleado->direccion->update($validatedData['direccion']);
            }

            $originalData = $empleado->getOriginal();
            $empleado->update(Arr::except($validatedData, ['direccion', 'user_id', 'create_user', 'remove_user']));

            $this->empleadoUserService->handleUserUpdateForEmpleado($empleado, $validatedData, $actor);

            event(new EmployeeUpdated($empleado, $originalData, $actor));

            return $empleado;
        });
    }

    public function deleteEmpleado(Empleado $empleado, ?User $actor = null): void
    {
        DB::transaction(function () use ($empleado, $actor) {
            $empleadoData = $empleado->toArray(); // Capturamos los datos antes de eliminar

            // Si tiene dirección, la eliminamos también
            if ($empleado->direccion) {
                $empleado->direccion->delete();
            }

            $empleado->delete();

            event(new EmployeeDeleted($empleadoData, $actor));
        });
    }

    /**
     * Cambia el estado de un empleado y dispara un evento.
     *
     * @param Empleado $empleado
     * @param integer $newStatusId
     * @param User|null $actor
     * @return Empleado
     */
    public function changeStatus(Empleado $empleado, int $newStatusId, ?User $actor = null): Empleado
    {
        $originalStatusId = $empleado->estado_id;

        // Si el estado no ha cambiado, no hacemos nada.
        if ($originalStatusId === $newStatusId) {
            return $empleado;
        }

        $empleado->update(['estado_id' => $newStatusId]);

        event(new EmployeeStatusChanged($empleado, $originalStatusId, $actor));

        return $empleado;
    }
}
