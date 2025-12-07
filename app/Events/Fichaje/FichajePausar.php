<?php

namespace App\Events\Fichaje;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Facades\Log;

class FichajePausar implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Horario $horario,
        public array $metadata = []
    ) {
        Log::info('FichajePausar creado', [
            'horario_id' => $horario->id,
            'usuario_id' => $this->getUserId()
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $userId = $this->getUserId();
        $channels = [new PrivateChannel('horarios.' . $this->horario->id)];
        
        if ($userId) {
            $channels[] = new PrivateChannel('App.Models.User.' . $userId);
        }
        
        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'fichaje.pausado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $empleado = null;
        if ($this->horario->contrato_id) {
            $empleado = $this->horario->contrato->empleado ?? null;
        } elseif ($this->horario->anexo_id) {
            $empleado = $this->horario->anexo->contrato->empleado ?? null;
        }

        return [
            'horario' => [
                'id' => $this->horario->id,
                'descanso_inicio' => $this->horario->descanso_inicio,
                'descansos' => $this->horario->descansos
            ],
            'action' => 'pausar',
            'metadata' => $this->metadata,
            'message' => 'Fichaje en pausa (inicio de descanso)',
            'timestamp' => now()->toIso8601String(),
            'empleado' => $empleado ? [
                'id' => $empleado->id,
                'nombre' => $empleado->nombre,
                'apellido' => $empleado->apellido
            ] : null
        ];
    }

    /**
     * Get the user ID associated with this horario.
     */
    private function getUserId(): ?int
    {
        if ($this->horario->contrato_id) {
            $empleado = $this->horario->contrato->empleado ?? null;
            return $empleado?->user_id;
        } elseif ($this->horario->anexo_id) {
            $empleado = $this->horario->anexo->contrato->empleado ?? null;
            return $empleado?->user_id;
        }
        
        return null;
    }
}