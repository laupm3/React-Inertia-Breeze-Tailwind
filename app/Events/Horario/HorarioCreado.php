<?php

namespace App\Events\Horario;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HorarioCreado implements ShouldBroadcast
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
        return 'horario.creado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->horario->id,
            'inicio' => $this->horario->inicio,
            'fin' => $this->horario->fin,
            'accion' => 'created',
            'mensaje' => 'Se ha creado un nuevo horario',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}