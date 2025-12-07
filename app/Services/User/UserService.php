<?php

namespace App\Services\User;

use App\Events\User\UserUpdated;
use App\Events\User\UserDeleted;
use App\Events\User\UserStatusChangeScheduled;
use App\Enums\UserStatus;
use App\Models\User;
use App\Models\Role;
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Crea un nuevo usuario y maneja sus relaciones iniciales.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $userData = [
                ...$data,
                'password' => $this->generateHashedPassword()
            ];

            $user = User::create($userData);

            Team::create([
                'name' => $user->name . '\'s Team',
                'user_id' => $user->id,
                'personal_team' => true,
                'description' => 'Personal team for ' . $user->name,
                'icon' => 'HandMetal',
                'bg_color' => '#fb902d',
                'icon_color' => '#ffffff',
            ]);

            if (isset($data['role_id'])) {
                $role = Role::find($data['role_id']);
                if ($role) {
                    $user->assignRole($role);
                }
            } else {
                $user->assignRole(Role::where('name', 'User')->first());
            }

            if (isset($data['photo'])) {
                $user->updateProfilePhoto($data['photo']);
            }

            return $user;
        });
    }

    /**
     * Actualiza un usuario existente y sus relaciones.
     */
    public function updateUser(User $user, array $data, ?User $actor = null): User
    {
        return DB::transaction(function () use ($user, $data, $actor) {
            // Guardar el estado original antes de la actualización
            $originalStatus = $user->status;
            
            // Actualizar el usuario
            $user->update($data);

            if (isset($data['role_id'])) {
                $role = Role::find($data['role_id']);
                if ($role) {
                    $user->syncRoles($role);
                }
            }

            if (isset($data['photo'])) {
                $user->updateProfilePhoto($data['photo']);
            }

            // Manejar programación de cambios de estado
            $this->handleStatusScheduling($user, $data, $originalStatus, $actor);

            event(new UserUpdated($user, $actor));

            return $user;
        });
    }

    /**
     * Maneja la programación de cambios de estado basado en las fechas proporcionadas.
     */
    private function handleStatusScheduling(User $user, array $data, UserStatus $originalStatus, ?User $actor = null): void
    {
        $newStatus = isset($data['status']) ? UserStatus::from($data['status']) : $originalStatus;
        $reason = $data['reason'] ?? 'Cambio de estado programado desde actualización de usuario';

        // Caso 1: Fecha de inicio de cambio (cambiar al nuevo estado)
        if (!empty($data['status_initial_date'])) {
            $scheduledAt = Carbon::parse($data['status_initial_date']);
            
            Log::info('🚀 Programando cambio de estado inicial', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'current_status' => $originalStatus->label(),
                'scheduled_status' => $newStatus->label(),
                'scheduled_at' => $scheduledAt->toISOString(),
                'reason' => $reason
            ]);

            event(new UserStatusChangeScheduled(
                user: $user,
                currentStatus: $originalStatus,
                scheduledStatus: $newStatus,
                scheduledAt: $scheduledAt,
                actor: $actor,
                reason: $reason
            ));
        }

        // Caso 2: Fecha de fin de cambio (volver a ACTIVO)
        if (!empty($data['status_final_date'])) {
            $scheduledAt = Carbon::parse($data['status_final_date']);
            
            Log::info('🔄 Programando retorno a estado activo', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'current_status' => $newStatus->label(),
                'scheduled_status' => UserStatus::ACTIVE->label(),
                'scheduled_at' => $scheduledAt->toISOString(),
                'reason' => 'Retorno automático a estado activo'
            ]);

            event(new UserStatusChangeScheduled(
                user: $user,
                currentStatus: $newStatus,
                scheduledStatus: UserStatus::ACTIVE,
                scheduledAt: $scheduledAt,
                actor: $actor,
                reason: 'Retorno automático a estado activo'
            ));
        }
    }

    /**
     * Elimina un usuario.
     */
    public function deleteUser(User $user, ?User $actor = null): bool
    {
        return DB::transaction(function () use ($user, $actor) {
            $isDeleted = $user->delete();

            if ($isDeleted) {
                event(new UserDeleted($user, $actor));
            }

            return $isDeleted;
        });
    }

    /**
     * Genera una contraseña aleatoria segura.
     * 
     * @return string
     */
    private function generatePassword(): string
    {
        // Usar Faker para generar una contraseña aleatoria que contenga letras, números y caracteres especiales
        return Str::password(
            length: 12,
            letters: true,
            numbers: true,
        );
    }

    /**
     * Hashea una contraseña utilizando el hasher de Laravel.
     * 
     * @param string $password
     */
    private function hashPassword(string $password): string
    {
        // Usar el hasher de Laravel para generar un hash seguro
        return Hash::make($password);
    }

    /**
     * Genera una contraseña aleatoria, la hashea y la retorna.
     * 
     * @return string Hashed password
     */
    private function generateHashedPassword(): string
    {
        $password = $this->generatePassword();
        return $this->hashPassword($password);
    }
}
