<?php

namespace App\Events\Horario;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HorarioEliminado implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public Horario $horario;

    /**
     * Create a new event instance.
     *
     * @param Horario $horario
     */
    public function __construct(Horario $horario)
    {
        $this->horario = $horario;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('horario.' . $this->horario->id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'horario.eliminado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->horario->id,
            'accion' => 'deleted',
            'mensaje' => 'Se ha eliminado un horario',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}