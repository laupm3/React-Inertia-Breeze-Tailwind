<?php

namespace App\Listeners\User;

use App\Events\User\UserBanned;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Escucha cuando un usuario es baneado para registrar un evento de seguridad.
 */
class LogUserBan implements ShouldQueue
{
    public function handle(UserBanned $event): void
    {
        Log::channel('security')->warning('Usuario ha sido baneado.', [
            'user_id' => $event->user->id,
            'user_email' => $event->user->email,
            'previous_status' => $event->oldStatus->name,
            'actor_id' => $event->actor?->id,
            'actor_email' => $event->actor?->email,
        ]);
    }
}
