<?php

namespace App\Events\User;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El usuario que ha sido actualizado.
     * @param User $user
     * @param User|null $actor El usuario que realizó la acción.
     */
    public function __construct(
        public readonly User $user,
        public readonly ?User $actor = null
    ) {}
}
