<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_name' => $this->job_name,
            'job_id' => $this->job_id,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'color' => $this->status->color(),
                'icon' => $this->status->icon(),
            ],
            'source' => $this->when($this->source, function () {
                return [
                    'type' => $this->source_type,
                    'id' => $this->source_id,
                    'model' => $this->source,
                ];
            }),
            'payload' => $this->payload,
            'error_message' => $this->error_message,
            'error_trace' => $this->when($request->user()?->hasRole('admin'), $this->error_trace),
            'started_at' => $this->started_at?->toISOString(),
            'finished_at' => $this->finished_at?->toISOString(),
            'execution_time' => $this->execution_time,
            'formatted_execution_time' => $this->formatted_execution_time,
            'duration' => $this->duration,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Información adicional para la UI
            'is_running' => $this->isRunning(),
            'is_pending' => $this->isPending(),
            'is_completed' => $this->isCompleted(),
            'is_failed' => $this->isFailed(),
            
            // Progreso calculado
            'progress' => $this->calculateProgress(),
        ];
    }

    /**
     * Calcular el progreso del job basado en el estado y payload
     */
    private function calculateProgress(): int
    {
        if ($this->isCompleted()) {
            return 100;
        }
        
        if ($this->isFailed()) {
            return 0;
        }
        
        if ($this->isPending()) {
            return 0;
        }
        
        if ($this->isRunning()) {
            // Intentar obtener el progreso del payload
            $step = $this->payload['step'] ?? '';
            
            return match($step) {
                'Iniciando exportación...' => 10,
                'Recopilando datos...' => 30,
                'Generando archivo...' => 60,
                'Guardando archivo...' => 80,
                default => 50, // Progreso por defecto para jobs en ejecución
            };
        }
        
        return 0;
    }
}
