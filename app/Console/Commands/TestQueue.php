<?php

namespace App\Console\Commands;

use App\Jobs\TestJob;
use App\Models\User;
use App\Enums\UserStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TestQueue extends Command
{
    protected $signature = 'queue:test {user_id} {status=3} {--delay=5}';
    protected $description = 'Test user status change queue';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $status = (int) $this->argument('status');
        $delay = (int) $this->option('delay');

        // Validar el usuario
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found!");
            return;
        }

        // Validar el estado
        if (!in_array($status, [0,1,2,3,4])) {
            $this->error("Invalid status value: {$status}");
            return;
        }

        $this->info("Testing status change for user #{$userId}");
        $this->info("Current status: " . $user->status->value);
        $this->info("New status: {$status}");
        $this->info("Delay: {$delay} minutes");

        // Mostrar jobs actuales
        $currentJobs = DB::table('jobs')->count();
        $this->info("\nCurrent jobs in queue: {$currentJobs}");

        // Programar el cambio de estado
        $scheduledAt = Carbon::now()->addMinutes($delay);
        TestJob::dispatch($user, UserStatus::from($status), $scheduledAt)
              ->delay($scheduledAt);

        $this->info("\nStatus change scheduled for: " . $scheduledAt->format('Y-m-d H:i:s'));

        // Mostrar jobs después de programar
        $newJobCount = DB::table('jobs')->count();
        $this->info("Jobs in queue after scheduling: {$newJobCount}");

        // Mostrar detalles del job programado
        $this->info("\nScheduled job details:");
        $job = DB::table('jobs')
                ->select(['id', 'queue', 'attempts', 'available_at', 'created_at'])
                ->orderBy('id', 'desc')
                ->first();

        if ($job) {
            $this->info("Job ID: {$job->id}");
            $this->info("Queue: {$job->queue}");
            $this->info("Attempts: {$job->attempts}");
            $this->info("Available at: " . date('Y-m-d H:i:s', $job->available_at));
            $this->info("Created at: " . date('Y-m-d H:i:s', $job->created_at));
        }

        $this->info("\nTo process the queue, run: php artisan queue:work --queue=user-status-queue");
    }
}
