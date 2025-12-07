<?php

namespace App\Events\Fichaje;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FichajeReanudar implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Horario $horario,
        public array $metadata = []
    ) {
        Log::info('FichajeReanudar creado', [
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
        
        if ($userId) {
            return [
                new PrivateChannel('user.fichaje.resume.' . $userId),
                new PrivateChannel('App.Models.User.' . $userId)
            ];
        }
        
        return [
            new PrivateChannel('horarios.' . $this->horario->id)
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'fichaje.reanudado';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $empleado = null;
        $userName = 'Usuario';
        
        // Obtener datos del contrato o anexo según corresponda
        if ($this->horario->contrato_id) {
            $empleado = $this->horario->contrato->empleado ?? null;
        } elseif ($this->horario->anexo_id) {
            $empleado = $this->horario->anexo->contrato->empleado ?? null;
        }
        
        // Obtener nombre de usuario si tenemos el empleado
        if ($empleado && $empleado->user) {
            $userName = $empleado->user->name;
        }

        // Construir datos para transmitir
        return [
            'horario' => [
                'id' => $this->horario->id,
                'descanso_fin' => $this->horario->descanso_fin,
                'horario_inicio' => $this->horario->horario_inicio,
                'fichaje_entrada' => $this->horario->fichaje_entrada,
                'descansos' => $this->horario->descansos
            ],
            'action' => 'resume',
            'metadata' => $this->metadata,
            'message' => "Fichaje reanudado a las " . 
                now()->format('H:i:s') . " por $userName",
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