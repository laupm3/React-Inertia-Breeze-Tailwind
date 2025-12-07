<?php

namespace App\Events\User;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando un usuario previamente suspendido
 * ha sido reactivado.
 */
class UserReactivated
{
    use Dispatchable, SerializesModels;

    /**
     * @param User $user El usuario que ha sido reactivado.
     * @param UserStatus $oldStatus El estado anterior del usuario (ej. SUSPENDED).
     * @param User|null $actor El administrador que realizó la acción.
     */
    public function __construct(
        public User $user,
        public UserStatus $oldStatus,
        public ?User $actor = null
    ) {}
}
