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
use Illuminate\Support\Facades\DB;

class TestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * El número de veces que se debe intentar el job.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * El número de segundos que el job puede ejecutarse antes de timeout.
     *
     * @var int
     */
    public $timeout = 30;

    /**
     * Indica si el job debe ser marcado como fallido en caso de timeout.
     *
     * @var bool
     */
    public $failOnTimeout = true;

    private $user;
    private $newStatus;
    private $scheduledAt;

    public function __construct(User $user, UserStatus $newStatus, \DateTime $scheduledAt)
    {
        $this->user = $user;
        $this->newStatus = $newStatus;
        $this->scheduledAt = $scheduledAt;
        $this->onQueue('user-status-queue');
    }

    public function handle(): void
    {
        Log::info('Starting user status change job', [
            'job_id' => $this->job->getJobId(),
            'user_id' => $this->user->id,
            'new_status' => $this->newStatus->value,
            'scheduled_at' => $this->scheduledAt->format('Y-m-d H:i:s'),
            'attempts' => $this->attempts()
        ]);

        try {
            DB::beginTransaction();

            // Actualizar el estado del usuario
            $this->user->status = $this->newStatus;
            $this->user->next_status = null;
            $this->user->scheduled_status_change_at = null;
            $this->user->save();

            // Registrar el cambio en los logs
            Log::info('User status changed successfully', [
                'user_id' => $this->user->id,
                'old_status' => $this->user->getOriginal('status'),
                'new_status' => $this->newStatus->value
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to change user status', [
                'user_id' => $this->user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Manejar un fallo del job
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(\Throwable $exception)
    {
        Log::error('User status change job failed', [
            'job_id' => $this->job->getJobId(),
            'user_id' => $this->user->id,
            'error' => $exception->getMessage()
        ]);
    }
}
