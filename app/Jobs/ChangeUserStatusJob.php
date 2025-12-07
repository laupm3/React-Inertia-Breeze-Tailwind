<?php

namespace App\Jobs;

use App\Models\User;
use App\Enums\UserStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Junges\TrackableJobs\TrackableJob;
use App\Traits\TrackableJobHelper;
use Throwable;

class ChangeUserStatusJob extends TrackableJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, TrackableJobHelper;

    protected $userId;
    protected $newStatus;
    protected $reason;
    protected $executedBy;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId, UserStatus $newStatus, string $reason = '', int $executedBy = null)
    {
        $this->userId = $userId;
        $this->newStatus = $newStatus;
        $this->reason = $reason;
        $this->executedBy = $executedBy;

        parent::__construct();
    }

    /**
     * Establece el ID del modelo que se está modificando.
     */
    public function trackableKey(): ?string
    {
        return (string) $this->userId;
    }

    /**
     * Establece el tipo de modelo que se está modificando.
     */
    public function trackableType(): ?string
    {
        return User::class;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Obtener el usuario antes del cambio
        $user = User::findOrFail($this->userId);
        $oldStatus = $user->status;

        // Guardar el estado original (pre_data)
        $this->savePreData([
            'user_id' => $this->userId,
            'old_status' => $oldStatus->value,
            'old_status_label' => $oldStatus->label(),
            'user_email' => $user->email,
            'user_name' => $user->name,
            'reason' => $this->reason,
            'executed_by' => $this->executedBy,
            'change_timestamp' => now()->toISOString()
        ]);

        Log::info("🔄 Cambiando estado de usuario", [
            'user_id' => $this->userId,
            'old_status' => $oldStatus->value,
            'new_status' => $this->newStatus->value,
            'reason' => $this->reason
        ]);

        // Realizar el cambio de estado
        $user->update([
            'status' => $this->newStatus
        ]);

        // Guardar el nuevo estado (post_data)
        $this->savePostData([
            'user_id' => $this->userId,
            'old_status' => $oldStatus->value,
            'new_status' => $this->newStatus->value,
            'new_status_label' => $this->newStatus->label(),
            'status_changed_at' => now()->toISOString(),
            'change_successful' => true,
            'message' => "Usuario {$user->name} cambió de {$oldStatus->label()} a {$this->newStatus->label()}"
        ]);

        Log::info("✅ Estado de usuario cambiado exitosamente", [
            'user_id' => $this->userId,
            'old_status' => $oldStatus->value,
            'new_status' => $this->newStatus->value,
            'user_name' => $user->name
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        // Guardar información del error
        $this->saveErrorData($exception, [
            'user_id' => $this->userId,
            'new_status' => $this->newStatus->value,
            'reason' => $this->reason,
            'executed_by' => $this->executedBy,
        ]);

        Log::error("❌ Job falló: ChangeUserStatusJob", [
            'user_id' => $this->userId,
            'new_status' => $this->newStatus->value,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
} 