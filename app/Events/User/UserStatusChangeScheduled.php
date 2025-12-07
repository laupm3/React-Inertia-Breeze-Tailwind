<?php

namespace App\Events\User;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Evento que se dispara cuando se programa un cambio de estado de usuario.
 * Este evento se dispara cuando se agenda un cambio futuro de estado.
 */
class UserStatusChangeScheduled
{
    use Dispatchable, SerializesModels;

    /**
     * @param User $user El usuario que tendrá el cambio de estado.
     * @param UserStatus $currentStatus El estado actual del usuario.
     * @param UserStatus $scheduledStatus El estado que se aplicará.
     * @param \Carbon\Carbon $scheduledAt La fecha y hora programada para el cambio.
     * @param User|null $actor El administrador que programó la acción.
     * @param string $reason La razón del cambio programado.
     */
    public function __construct(
        public User $user,
        public UserStatus $currentStatus,
        public UserStatus $scheduledStatus,
        public \Carbon\Carbon $scheduledAt,
        public ?User $actor = null,
        public string $reason = ''
    ) {}
} 