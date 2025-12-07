<?php

namespace App\Services\Empleado;

use App\Models\User;
use App\Models\Empleado;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Events\User\UserCreated;
use App\Events\User\UserAssignedToEmployee;

class EmpleadoUserService
{
    /**
     * Maneja la creación o asociación de usuario para un empleado
     *
     * @param Empleado $empleado
     * @param array $data
     * @param User|null $actor
     * @return User|null
     */
    public function handleUserForEmpleado(Empleado $empleado, array $data, ?User $actor = null): ?User
    {
        $user = null;

        // Si se proporciona un user_id, asociar usuario existente
        if (!empty($data['user_id'])) {
            $user = $this->associateExistingUser($empleado, $data['user_id'], $actor);
        }
        // Si se solicita crear un nuevo usuario
        elseif (!empty($data['create_user']) && $data['create_user']) {
            $user = $this->createNewUserForEmpleado($empleado, $data);
        }

        return $user;
    }

    /**
     * Maneja la actualización de usuario para un empleado existente
     *
     * @param Empleado $empleado
     * @param array $data
     * @return User|null
     */
    public function handleUserUpdateForEmpleado(Empleado $empleado, array $data): ?User
    {
        $user = null;

        // Si se solicita remover el usuario actual
        if (!empty($data['remove_user']) && $data['remove_user']) {
            $this->disassociateUser($empleado);
            return null;
        }

        // Si se proporciona un user_id, asociar usuario existente
        if (!empty($data['user_id'])) {
            $user = $this->associateExistingUser($empleado, $data['user_id']);
        }
        // Si se solicita crear un nuevo usuario
        elseif (!empty($data['create_user']) && $data['create_user']) {
            $user = $this->createNewUserForEmpleado($empleado, $data);
        }

        return $user;
    }

    /**
     * Asocia un usuario existente al empleado
     *
     * @param Empleado $empleado
     * @param int $userId
     * @param User|null $actor
     * @return User
     * @throws \Exception
     */
    protected function associateExistingUser(Empleado $empleado, int $userId, ?User $actor = null): User
    {
        $user = User::findOrFail($userId);

        // Verificar que el usuario no tenga empleado asociado (excepto el actual)
        if ($user->empleado_id && $user->empleado_id !== $empleado->id) {
            throw new \Exception('El usuario ya tiene un empleado asociado.');
        }

        // Si el empleado ya tiene un usuario, desasociarlo primero
        if ($empleado->user && $empleado->user->id !== $user->id) {
            $this->disassociateUser($empleado);
        }

        // Actualizar el usuario con el empleado_id
        $user->update(['empleado_id' => $empleado->id]);

        event(new UserAssignedToEmployee($user, $empleado, $actor));

        return $user;
    }

    /**
     * Crea un nuevo usuario para el empleado
     *
     * @param Empleado $empleado
     * @param array $data
     * @return User
     */
    protected function createNewUserForEmpleado(Empleado $empleado, array $data): User
    {
        // Si el empleado ya tiene un usuario, desasociarlo primero
        if ($empleado->user) {
            $this->disassociateUser($empleado);
        }

        // Generar nombre de usuario basado en el email del empleado
        $username = $this->generateUsername($empleado->email);

        // Generar contraseña temporal
        $temporaryPassword = $this->generateTemporaryPassword();

        $user = User::create([
            'name' => $empleado->nombre . ' ' . $empleado->primer_apellido,
            'email' => $empleado->email,
            'username' => $username,
            'password' => Hash::make($temporaryPassword),
            'empleado_id' => $empleado->id,
            'email_verified_at' => now(), // Asumimos que el email está verificado
        ]);

        event(new UserCreated($user, $temporaryPassword));

        return $user;
    }

    /**
     * Genera un nombre de usuario único basado en el email
     *
     * @param string $email
     * @return string
     */
    protected function generateUsername(string $email): string
    {
        $baseUsername = explode('@', $email)[0];
        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Genera una contraseña temporal
     *
     * @return string
     */
    protected function generateTemporaryPassword(): string
    {
        return Str::random(12);
    }

    /**
     * Desasocia un usuario de un empleado
     *
     * @param Empleado $empleado
     * @return bool
     */
    public function disassociateUser(Empleado $empleado): bool
    {
        if ($empleado->user) {
            $empleado->user->update(['empleado_id' => null]);
            return true;
        }

        return false;
    }

    /**
     * Valida si se puede asociar un usuario a un empleado
     *
     * @param int $userId
     * @param int|null $empleadoId
     * @return bool
     */
    public function canAssociateUser(int $userId, ?int $empleadoId = null): bool
    {
        $user = User::find($userId);

        if (!$user) {
            return false;
        }

        // Si no hay empleado_id, verificar que el usuario no tenga empleado
        if (!$empleadoId) {
            return is_null($user->empleado_id);
        }

        // Si hay empleado_id, verificar que el usuario no tenga empleado o que sea el mismo
        return is_null($user->empleado_id) || $user->empleado_id === $empleadoId;
    }

    /**
     * Obtiene las opciones disponibles para el manejo de usuarios
     *
     * @param int|null $empleadoId
     * @return array
     */
    public function getAvailableOptions(?int $empleadoId = null): array
    {
        $query = User::whereNull('empleado_id');

        // Si es una actualización, incluir también el usuario actual
        if ($empleadoId) {
            $query->orWhere('empleado_id', $empleadoId);
        }

        return [
            'associate_existing' => $query->get(['id', 'name', 'email']),
            'create_new' => true,
            'no_user' => true,
            'remove_user' => $empleadoId ? true : false,
        ];
    }

    /**
     * Obtiene información del usuario actual del empleado
     *
     * @param Empleado $empleado
     * @return array|null
     */
    public function getCurrentUserInfo(Empleado $empleado): ?array
    {
        if (!$empleado->user) {
            return null;
        }

        return [
            'id' => $empleado->user->id,
            'name' => $empleado->user->name,
            'email' => $empleado->user->email,
            'username' => $empleado->user->username,
        ];
    }
}
