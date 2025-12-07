<?php

namespace App\Models;

use App\Enums\JobStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JobLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_name',
        'job_id',
        'status',
        'source_type',
        'source_id',
        'payload',
        'error_message',
        'error_trace',
        'started_at',
        'finished_at',
        'execution_time',
    ];

    protected $casts = [
        'status' => JobStatus::class,
        'payload' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    /**
     * Relación polimórfica con el modelo que disparó el job
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeByStatus($query, JobStatus $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por tipo de job
     */
    public function scopeByJobName($query, string $jobName)
    {
        return $query->where('job_name', $jobName);
    }

    /**
     * Scope para filtrar por fuente
     */
    public function scopeBySource($query, string $sourceType, int $sourceId = null)
    {
        $query->where('source_type', $sourceType);
        
        if ($sourceId) {
            $query->where('source_id', $sourceId);
        }
        
        return $query;
    }

    /**
     * Scope para jobs recientes
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Verificar si el job está en ejecución
     */
    public function isRunning(): bool
    {
        return $this->status === JobStatus::RUNNING;
    }

    /**
     * Verificar si el job está pendiente
     */
    public function isPending(): bool
    {
        return $this->status === JobStatus::PENDING;
    }

    /**
     * Verificar si el job se completó exitosamente
     */
    public function isCompleted(): bool
    {
        return $this->status === JobStatus::COMPLETED;
    }

    /**
     * Verificar si el job falló
     */
    public function isFailed(): bool
    {
        return $this->status === JobStatus::FAILED;
    }

    /**
     * Obtener el tiempo de ejecución formateado
     */
    public function getFormattedExecutionTimeAttribute(): string
    {
        if (!$this->execution_time) {
            return 'N/A';
        }

        if ($this->execution_time < 60) {
            return $this->execution_time . 's';
        }

        $minutes = floor($this->execution_time / 60);
        $seconds = $this->execution_time % 60;
        
        return $minutes . 'm ' . $seconds . 's';
    }

    /**
     * Obtener la duración desde que se creó
     */
    public function getDurationAttribute(): string
    {
        if ($this->finished_at) {
            return $this->created_at->diffForHumans($this->finished_at, true);
        }

        return $this->created_at->diffForHumans(now(), true);
    }
}
