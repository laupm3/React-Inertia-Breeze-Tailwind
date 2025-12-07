<?php

namespace App\Listeners\User;

use App\Events\User\UserStatusChangeScheduled;
use App\Jobs\ChangeUserStatusJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener que programa el cambio de estado de usuario para una fecha futura.
 * Este listener crea un job programado que se ejecutará en la fecha especificada.
 */
class ScheduleUserStatusChange implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserStatusChangeScheduled $event): void
    {
        try {
            Log::info("🔄 Programando cambio de estado de usuario", [
                'user_id' => $event->user->id,
                'user_name' => $event->user->name,
                'current_status' => $event->currentStatus->label(),
                'scheduled_status' => $event->scheduledStatus->label(),
                'scheduled_at' => $event->scheduledAt->toISOString(),
                'reason' => $event->reason,
                'actor_id' => $event->actor?->id,
                'actor_name' => $event->actor?->name,
            ]);

            // Programar el job para la fecha especificada
            ChangeUserStatusJob::dispatch(
                userId: $event->user->id,
                newStatus: $event->scheduledStatus,
                reason: $event->reason,
                executedBy: $event->actor?->id
            )->delay($event->scheduledAt);

            Log::info("✅ Cambio de estado programado exitosamente", [
                'user_id' => $event->user->id,
                'job_scheduled_for' => $event->scheduledAt->toISOString(),
            ]);

        } catch (\Exception $e) {
            Log::error("❌ Error al programar cambio de estado de usuario", [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(UserStatusChangeScheduled $event, \Throwable $exception): void
    {
        Log::error("❌ Listener falló: ScheduleUserStatusChange", [
            'user_id' => $event->user->id,
            'scheduled_status' => $event->scheduledStatus->label(),
            'scheduled_at' => $event->scheduledAt->toISOString(),
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
} 