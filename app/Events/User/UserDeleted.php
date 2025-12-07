<?php

namespace App\Events\User;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public readonly int $userId;
    public readonly string $userName;
    public readonly string $userEmail;
    public readonly ?int $actorId;

    /**
     * Capturamos los datos del usuario porque el modelo será eliminado.
     * El evento RECIBE el actor, no lo busca por sí mismo.
     * @param User $user El usuario que se va a eliminar.
     * @param User|null $actor El usuario que realizó la acción.
     */
    public function __construct(User $user, ?User $actor = null)
    {
        $this->userId = $user->id;
        $this->userName = $user->name;
        $this->userEmail = $user->email;
        $this->actorId = $actor?->id;
    }
}
