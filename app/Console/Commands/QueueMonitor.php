<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class QueueMonitor extends Command
{
    protected $signature = 'queue:monitor-live';
    protected $description = 'Monitor queue activity in real-time';

    public function handle()
    {
        $this->info('Monitoring queues in real-time...');
        $this->info('Press Ctrl+C to stop');

        while (true) {
            // Limpiar la pantalla
            $this->output->write(sprintf("\033\143"));

            // Obtener estadísticas
            $stats = [
                'total' => DB::table('jobs')->count(),
                'user_status' => DB::table('jobs')->where('queue', 'user-status')->count(),
                'test_queue' => DB::table('jobs')->where('queue', 'test-queue')->count(),
                'failed' => DB::table('failed_jobs')->count()
            ];

            // Mostrar estadísticas
            $this->info('=== Queue Statistics ===');
            $this->info('Total jobs: ' . $stats['total']);
            $this->info('User status jobs: ' . $stats['user_status']);
            $this->info('Test queue jobs: ' . $stats['test_queue']);
            $this->info('Failed jobs: ' . $stats['failed']);
            $this->info('');

            // Mostrar últimos 5 jobs
            $this->info('=== Latest Jobs ===');
            $jobs = DB::table('jobs')
                     ->select(['id', 'queue', 'attempts', 'available_at', 'created_at'])
                     ->orderBy('id', 'desc')
                     ->limit(5)
                     ->get();

            foreach ($jobs as $job) {
                $this->info("ID: {$job->id} | Queue: {$job->queue} | Attempts: {$job->attempts}");
            }

            sleep(2); // Actualizar cada 2 segundos
        }
    }
}
