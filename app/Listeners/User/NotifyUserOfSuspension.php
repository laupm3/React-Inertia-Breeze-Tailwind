<?php

namespace App\Listeners\User;

use App\Events\User\UserSuspended;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Escucha cuando un usuario es suspendido para disparar las notificaciones
 * utilizando el sistema de notificaciones configurable.
 */
class NotifyUserOfSuspension implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserSuspended $event): void
    {
        $this->sendNotification($event->user, 'suspended');
    }
}
