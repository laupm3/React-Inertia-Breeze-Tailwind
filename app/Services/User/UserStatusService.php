<?php

namespace App\Services\User;

use App\Enums\UserStatus;
use App\Events\User\UserBanned;
use App\Events\User\UserReactivated;
use App\Events\User\UserSuspended;
use App\Models\User;

/**
 * Servicio para orquestar los cambios de estado MANUALES de los Usuarios.
 */
class UserStatusService
{
    /**
     * Cambia el estado de un usuario inmediatamente y dispara el evento correspondiente.
     *
     * @param User $user El usuario a modificar.
     * @param UserStatus $newStatus El nuevo estado.
     * @param User|null $actor El usuario que realiza la acción (para auditoría).
     * @return bool
     */
    public function changeStatus(User $user, UserStatus $newStatus, ?User $actor = null): bool
    {
        $oldStatus = $user->status;

        if ($oldStatus === $newStatus) {
            return true; // No hay cambios que hacer.
        }

        $user->status = $newStatus;
        $user->save();

        // Disparamos el evento específico para que los listeners actúen.
        $this->dispatchStatusChangeEvent($user, $oldStatus, $newStatus, $actor);

        return true;
    }

    /**
     * Centraliza la lógica para decidir qué evento disparar basado en el nuevo estado.
     */
    private function dispatchStatusChangeEvent(User $user, UserStatus $oldStatus, UserStatus $newStatus, ?User $actor): void
    {
        $event = match ($newStatus) {
            UserStatus::BANNED => new UserBanned($user, $oldStatus, $actor),
            UserStatus::SUSPENDED => new UserSuspended($user, $oldStatus, $actor),
            UserStatus::ACTIVE => new UserReactivated($user, $oldStatus, $actor),
            default => null,
        };

        if ($event) {
            event($event);
        }
    }
}
