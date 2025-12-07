<?php

namespace App\Events\Asignacion;

use App\Models\User;
use App\Models\Asignacion;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class UsuarioAsignado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct( 
        public User $usuario,
        public Asignacion $asignacion
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('asignaciones'),
        ];
    }
    
    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'usuario.asignado';
    }
}