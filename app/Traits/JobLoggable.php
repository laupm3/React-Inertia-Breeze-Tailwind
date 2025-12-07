<?php

namespace App\Traits;

use App\Enums\JobStatus;
use App\Models\JobLog;
use Illuminate\Contracts\Queue\Job as QueueJob;
use Illuminate\Support\Facades\Log;
use Throwable;

trait JobLoggable
{
    protected ?JobLog $jobLog = null;
    protected $startTime;

    /**
     * Crear el registro de log al inicio del job
     */
    protected function createJobLog($source = null, array $payload = []): JobLog
    {
        // DEBUG: Agregar logging para debug
        Log::info('🔍 DEBUG: Creando JobLog', [
            'job_class' => static::class,
            'source_type' => $source ? get_class($source) : null,
            'source_id' => $source?->id,
            'payload' => $payload,
        ]);

        try {
            $this->jobLog = JobLog::create([
                'job_name' => static::class,
                'job_id' => $this->job?->getJobId(),
                'status' => JobStatus::PENDING,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source?->id,
                'payload' => $payload,
            ]);

            Log::info('✅ DEBUG: JobLog creado exitosamente', [
                'job_log_id' => $this->jobLog->id,
                'job_name' => $this->jobLog->job_name,
            ]);

            return $this->jobLog;
        } catch (Throwable $e) {
            Log::error('❌ DEBUG: Error al crear JobLog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Actualizar el estado del job a ejecutándose
     */
    protected function markJobAsRunning(): void
    {
        Log::info('🔍 DEBUG: Marcando job como running', [
            'job_log_id' => $this->jobLog?->id,
        ]);

        if ($this->jobLog) {
            $this->startTime = microtime(true);
            $this->jobLog->update([
                'status' => JobStatus::RUNNING,
                'started_at' => now(),
            ]);

            Log::info('✅ DEBUG: Job marcado como running');
        } else {
            Log::error('❌ DEBUG: No hay jobLog para marcar como running');
        }
    }

    /**
     * Marcar el job como completado exitosamente
     */
    protected function markJobAsCompleted(): void
    {
        Log::info('🔍 DEBUG: Marcando job como completado', [
            'job_log_id' => $this->jobLog?->id,
        ]);

        if ($this->jobLog) {
            $executionTime = $this->startTime ? round(microtime(true) - $this->startTime) : null;
            
            $this->jobLog->update([
                'status' => JobStatus::COMPLETED,
                'finished_at' => now(),
                'execution_time' => $executionTime,
            ]);

            Log::info('✅ DEBUG: Job marcado como completado', [
                'execution_time' => $executionTime,
            ]);
        } else {
            Log::error('❌ DEBUG: No hay jobLog para marcar como completado');
        }
    }

    /**
     * Marcar el job como fallido
     */
    protected function markJobAsFailed(Throwable $exception): void
    {
        Log::info('🔍 DEBUG: Marcando job como fallido', [
            'job_log_id' => $this->jobLog?->id,
            'error' => $exception->getMessage(),
        ]);

        if ($this->jobLog) {
            $executionTime = $this->startTime ? round(microtime(true) - $this->startTime) : null;
            
            $this->jobLog->update([
                'status' => JobStatus::FAILED,
                'finished_at' => now(),
                'execution_time' => $executionTime,
                'error_message' => $exception->getMessage(),
                'error_trace' => $exception->getTraceAsString(),
            ]);
        }

        // También loguear el error en los logs de Laravel
        Log::error('Job failed: ' . static::class, [
            'job_log_id' => $this->jobLog?->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    /**
     * Obtener el JobLog actual
     */
    public function getJobLog(): ?JobLog
    {
        return $this->jobLog;
    }

    /**
     * Actualizar el payload del job
     */
    protected function updateJobPayload(array $payload): void
    {
        Log::info('🔍 DEBUG: Actualizando payload', [
            'job_log_id' => $this->jobLog?->id,
            'new_payload' => $payload,
        ]);

        if ($this->jobLog) {
            $this->jobLog->update([
                'payload' => array_merge($this->jobLog->payload ?? [], $payload),
            ]);
        }
    }

    /**
     * Método helper para usar en el handle() del job
     */
    protected function executeWithLogging(callable $callback, $source = null, array $payload = []): mixed
    {
        Log::info('🔍 DEBUG: Iniciando executeWithLogging', [
            'job_class' => static::class,
        ]);

        try {
            // Crear el log al inicio
            $this->createJobLog($source, $payload);
            
            // Marcar como ejecutándose
            $this->markJobAsRunning();
            
            // Ejecutar la lógica del job
            $result = $callback();
            
            // Marcar como completado
            $this->markJobAsCompleted();
            
            Log::info('✅ DEBUG: executeWithLogging completado exitosamente');
            
            return $result;
            
        } catch (Throwable $exception) {
            Log::error('❌ DEBUG: executeWithLogging falló', [
                'error' => $exception->getMessage(),
            ]);

            // Marcar como fallido
            $this->markJobAsFailed($exception);
            
            // Re-lanzar la excepción para que Laravel la maneje
            throw $exception;
        }
    }
}
