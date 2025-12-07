<?php

namespace App\Listeners\User;

use App\Events\User\UserUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogUserUpdate implements ShouldQueue
{
    public function handle(UserUpdated $event): void
    {
        Log::channel('audit')->info('Usuario Actualizado', [
            'user_id' => $event->user->id,
            'name' => $event->user->name,
            'email' => $event->user->email,
            'changes' => $event->user->getDirty(), // Muestra solo los campos que cambiaron
            'actor_id' => $event->actor?->id,
        ]);
    }
}
