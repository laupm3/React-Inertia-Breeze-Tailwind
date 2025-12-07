<?php

namespace App\Listeners\User;

use App\Events\User\UserBanned;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Escucha cuando un usuario es baneado para disparar las notificaciones utilizando el sistema de notificaciones configurable.
 */
class NotifyUserOfBan implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserBanned $event): void
    {
        $this->sendNotification($event->user, 'banned');
    }
}
