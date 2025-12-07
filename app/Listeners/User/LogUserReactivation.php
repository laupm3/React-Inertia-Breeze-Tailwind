<?php

namespace App\Listeners\User;

use App\Events\User\UserReactivated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Escucha cuando un usuario es reactivado para registrarlo en el log de auditoría.
 */
class LogUserReactivation implements ShouldQueue
{
    public function handle(UserReactivated $event): void
    {
        Log::channel('audit')->info('User has been reactivated.', [
            'user_id' => $event->user->id,
            'user_email' => $event->user->email,
            'previous_status' => $event->oldStatus->name,
            'actor_id' => $event->actor?->id,
            'actor_email' => $event->actor?->email,
        ]);
    }
}
