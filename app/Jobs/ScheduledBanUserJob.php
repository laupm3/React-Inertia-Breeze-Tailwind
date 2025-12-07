<?php

namespace App\Jobs;

use App\Models\User;
use App\Enums\UserStatus;
use App\Services\User\UserStatusService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScheduledBanUserJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public User $user,
        public string $reason = 'Baneo programado',
        public ?int $scheduledBy = null
    ) {
        // Cambiar la cola por defecto
        $this->onQueue('default');
    }

    public function handle(UserStatusService $userStatusService): void
    {
        Log::info("=== EJECUTANDO JOB DE BANEO ===", [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'reason' => $this->reason,
            'scheduled_by' => $this->scheduledBy,
            'execution_time' => now()->toDateTimeString(),
            'job_id' => $this->job?->getJobId()
        ]);

        try {
            // Refrescar usuario
            $this->user->refresh();

            Log::info("Estado del usuario antes del baneo", [
                'user_id' => $this->user->id,
                'current_status' => $this->user->status,
                'next_status' => $this->user->next_status,
            ]);

            // Verificar si ya está baneado
            if ($this->user->status === 4) {
                Log::info("Usuario ya baneado, cancelando job", [
                    'user_id' => $this->user->id
                ]);
                return;
            }

            // Usar el servicio para banear
            $success = $userStatusService->changeUserStatus($this->user, UserStatus::BANNED);

            if ($success) {
                // Limpiar campos de programación
                $this->user->update([
                    'next_status' => null,
                    'scheduled_status_change_at' => null,
                    'scheduled_ban_reason' => null
                ]);

                Log::info("=== BANEO COMPLETADO ===", [
                    'user_id' => $this->user->id,
                    'new_status' => $this->user->fresh()->status,
                    'success' => true
                ]);
            } else {
                Log::error("Falló el cambio de estado", [
                    'user_id' => $this->user->id
                ]);
                throw new \Exception("No se pudo cambiar el estado del usuario");
            }

        } catch (\Exception $e) {
            Log::error("=== ERROR EN JOB DE BANEO ===", [
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("=== JOB DE BANEO FALLÓ ===", [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);
    }
}
