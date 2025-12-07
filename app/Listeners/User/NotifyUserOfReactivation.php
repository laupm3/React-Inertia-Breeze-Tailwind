<?php

namespace App\Listeners\User;

use App\Events\User\UserReactivated;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Escucha cuando un usuario es reactivado para disparar las notificaciones
 * utilizando el sistema de notificaciones configurable.
 */
class NotifyUserOfReactivation implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserReactivated $event): void
    {
        $this->sendNotification($event->user, 'reactivated');
    }
}
