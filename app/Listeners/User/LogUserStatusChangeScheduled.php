<?php

namespace App\Listeners\User;

use App\Events\User\UserStatusChangeScheduled;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener que registra en logs cuando se programa un cambio de estado de usuario.
 * Este listener se ejecuta de forma síncrona para asegurar que se registre inmediatamente.
 */
class LogUserStatusChangeScheduled
{
    /**
     * Handle the event.
     */
    public function handle(UserStatusChangeScheduled $event): void
    {
        Log::info("📅 Cambio de estado de usuario programado", [
            'user_id' => $event->user->id,
            'user_name' => $event->user->name,
            'user_email' => $event->user->email,
            'current_status' => $event->currentStatus->value,
            'current_status_label' => $event->currentStatus->label(),
            'scheduled_status' => $event->scheduledStatus->value,
            'scheduled_status_label' => $event->scheduledStatus->label(),
            'scheduled_at' => $event->scheduledAt->toISOString(),
            'scheduled_in_minutes' => now()->diffInMinutes($event->scheduledAt),
            'reason' => $event->reason,
            'actor_id' => $event->actor?->id,
            'actor_name' => $event->actor?->name,
            'actor_email' => $event->actor?->email,
            'timestamp' => now()->toISOString(),
        ]);
    }
} 