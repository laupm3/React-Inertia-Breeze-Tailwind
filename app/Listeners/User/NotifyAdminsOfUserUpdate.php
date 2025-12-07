<?php

namespace App\Listeners\User;

use App\Events\User\UserUpdated;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyAdminsOfUserUpdate implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserUpdated $event): void
    {
        // Notifica a los admins sobre la actualización.
        $this->sendNotification($event->user, 'updated');
    }
}
