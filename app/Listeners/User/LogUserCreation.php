<?php

namespace App\Listeners\User;

use App\Events\User\UserCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogUserCreation implements ShouldQueue
{
    public function handle(UserCreated $event): void
    {
        Log::channel('audit')->info('Usuario Creado', [
            'user_id' => $event->user->id,
            'name' => $event->user->name,
            'email' => $event->user->email,
            'actor_id' => $event->actor?->id,
        ]);
    }
}
