<?php

namespace App\Events\User;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando un usuario ha sido baneado.
 * Este es un evento de alta prioridad de seguridad.
 */
class UserBanned
{
    use Dispatchable, SerializesModels;

    /**
     * @param User $user El usuario que ha sido baneado.
     * @param UserStatus $oldStatus El estado anterior del usuario.
     * @param User|null $actor El administrador que realizó la acción.
     */
    public function __construct(
        public User $user,
        public UserStatus $oldStatus,
        public ?User $actor = null
    ) {}
}
