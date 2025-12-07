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

class FichajeEnCurso implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El tipo de acción de fichaje
     * 
     * @var string
     */
    public $accion;

    /**
     * Datos adicionales del fichaje
     * 
     * @var array
     */
    public $datos;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Horario $horario,
        string $accion = 'update',
        array $datos = []
    ) {
        $this->accion = $accion;
        $this->datos = $datos;
        
        Log::info("FichajeEnCurso creado - Acción: {$accion}", [
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
        $channels = [new PrivateChannel('horarios.'.$this->horario->id)];
        
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
        return 'fichaje.' . $this->accion;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'horario' => [
                'id' => $this->horario->id,
                'fichaje_entrada' => $this->horario->fichaje_entrada,
                'fichaje_salida' => $this->horario->fichaje_salida,
                'descanso_inicio' => $this->horario->descanso_inicio,
                'descanso_fin' => $this->horario->descanso_fin,
                'descansos' => $this->horario->descansos,
            ],
            'action' => $this->accion,
            'datos' => $this->datos,
            'timestamp' => now()->toIso8601String()
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