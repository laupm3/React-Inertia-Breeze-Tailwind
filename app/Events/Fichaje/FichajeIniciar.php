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

class FichajeIniciar implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Horario $horario,
        public array $metadata = []
    ) {
        Log::info('FichajeIniciar creado', [
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
        return 'fichaje.iniciado';
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
                'fichaje_entrada' => $this->horario->fichaje_entrada,
                'horario_inicio' => $this->horario->horario_inicio,
                'horario_fin' => $this->horario->horario_fin
            ],
            'action' => 'inicio',
            'metadata' => $this->metadata,
            'message' => "Fichaje iniciado a las " . 
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