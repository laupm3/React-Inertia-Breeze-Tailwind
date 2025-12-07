<?php

namespace App\Listeners\User;

use App\Events\User\UserSuspended;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Escucha cuando un usuario es suspendido para registrarlo en el log de auditoría.
 */
class LogUserSuspension implements ShouldQueue
{
    public function handle(UserSuspended $event): void
    {
        Log::channel('audit')->info('User has been suspended.', [
            'user_id' => $event->user->id,
            'user_email' => $event->user->email,
            'previous_status' => $event->oldStatus->name,
            'actor_id' => $event->actor?->id,
            'actor_email' => $event->actor?->email,
        ]);
    }
}
