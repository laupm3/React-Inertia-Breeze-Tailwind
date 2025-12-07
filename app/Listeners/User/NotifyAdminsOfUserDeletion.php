<?php

namespace App\Listeners\User;

use App\Events\User\UserDeleted;
use App\Traits\GenericNotificationTrait;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyAdminsOfUserDeletion implements ShouldQueue
{
    use GenericNotificationTrait;

    public function handle(UserDeleted $event): void
    {
        $userData = (object)[
            'id' => $event->userId,
            'name' => $event->userName
        ];

        // El modelo es 'user' para que encuentre la regla en el config.
        $this->sendNotification($userData, 'deleted', ['model_class' => \App\Models\User::class]);
    }
}
