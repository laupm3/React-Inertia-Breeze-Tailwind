<?php

namespace App\Listeners\User;

use App\Events\User\UserDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogUserDeletion implements ShouldQueue
{
    public function handle(UserDeleted $event): void
    {
        Log::channel('audit')->info('Usuario Eliminado', [
            'user_id' => $event->userId,
            'name' => $event->userName,
            'email' => $event->userEmail,
            'actor_id' => $event->actorId,
        ]);
    }
}
