<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait TrackableJobHelper
{
    /**
     * Guardar datos previos a la ejecución del job
     */
    protected function savePreData(array $data = []): void
    {
        if ($this->trackedJob) {
            $this->trackedJob->update([
                'user_id' => $this->getUserId(),
                'pre_data' => array_merge($data, [
                    'job_class' => static::class,
                    'change_type' => 'status_change',
                    'timestamp' => now()->toISOString(),
                ])
            ]);
        }
    }

    /**
     * Guardar el nuevo estado después del cambio
     */
    protected function savePostData(array $data = []): void
    {
        if ($this->trackedJob) {
            $this->trackedJob->update([
                'post_data' => array_merge($data, [
                    'change_type' => 'status_change',
                    'change_successful' => true,
                    'completed_at' => now()->toISOString(),
                ])
            ]);
        }
    }

    /**
     * Guardar información de error
     */
    protected function saveErrorData(\Throwable $exception, array $additionalData = []): void
    {
        if ($this->trackedJob) {
            $this->trackedJob->update([
                'post_data' => array_merge($additionalData, [
                    'status' => 'failed',
                    'error_message' => $exception->getMessage(),
                    'error_trace' => $exception->getTraceAsString(),
                    'failed_at' => now()->toISOString(),
                ])
            ]);
        }
    }

    /**
     * Obtener el ID del usuario actual
     */
    protected function getUserId(): ?int
    {
        // Si el job tiene una propiedad senderId, usarla
        if (isset($this->senderId)) {
            return $this->senderId;
        }

        // Si el job tiene una propiedad userId, usarla
        if (isset($this->userId)) {
            return $this->userId;
        }

        // Si hay un usuario autenticado, usar su ID
        if (Auth::check()) {
            return Auth::id();
        }

        return null;
    }

    /**
     * Obtener datos previos del job
     */
    protected function getPreData(): ?array
    {
        return $this->trackedJob?->pre_data;
    }

    /**
     * Obtener datos posteriores del job
     */
    protected function getPostData(): ?array
    {
        return $this->trackedJob?->post_data;
    }

    /**
     * Obtener información del cambio de estado
     */
    protected function getStatusChangeInfo(): ?array
    {
        $preData = $this->getPreData();
        $postData = $this->getPostData();

        if (!$preData || !$postData) {
            return null;
        }

        return [
            'old_status' => $preData['old_status'] ?? $preData['old_estado_nombre'] ?? null,
            'new_status' => $postData['new_status'] ?? $postData['new_estado_nombre'] ?? null,
            'changed_at' => $postData['status_changed_at'] ?? $postData['completed_at'] ?? null,
            'reason' => $preData['reason'] ?? null,
            'executed_by' => $preData['executed_by'] ?? null,
        ];
    }
} 