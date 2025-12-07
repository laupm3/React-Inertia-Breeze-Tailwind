<?php

namespace App\Events\User;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando un usuario ha sido suspendido temporalmente.
 */
class UserSuspended
{
    use Dispatchable, SerializesModels;

    /**
     * @param User $user El usuario que ha sido suspendido.
     * @param UserStatus $oldStatus El estado anterior del usuario.
     * @param User|null $actor El administrador que realizó la acción.
     */
    public function __construct(
        public User $user,
        public UserStatus $oldStatus,
        public ?User $actor = null
    ) {}
}
