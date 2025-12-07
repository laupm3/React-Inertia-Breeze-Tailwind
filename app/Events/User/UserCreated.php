<?php

namespace App\Events\User;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UserCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El usuario que acaba de ser creado.
     * @param User $user
     * @param string|null $temporaryPassword La contraseña temporal si se generó una.
     * @param User|null $actor El usuario que realizó la acción.
     */
    public function __construct(
        public readonly User $user,
        public readonly ?string $temporaryPassword = null,
        public readonly ?User $actor = null
    ) {
        Log::info('Evento UserCreated disparado', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_temporary_password' => !empty($temporaryPassword),
            'actor_id' => $actor?->id ?? 'Sistema'
        ]);
    }
}
