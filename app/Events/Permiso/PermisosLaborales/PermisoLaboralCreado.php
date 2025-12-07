<?php

namespace App\Events\Permiso\PermisosLaborales;

use App\Models\Permiso;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermisoLaboralCreado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Permiso $permiso
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Obtener IDs de usuarios administradores y RRHH
        $userIds = User::role([
            'Administrator',
            'Super Admin',
            'RRHH',
            'Human Resources',
            'Manager',
            'Team Lead'
        ])->pluck('id');
        
        $channels = [];
        foreach ($userIds as $userId) {
            $channels[] = new PrivateChannel("App.Models.User.{$userId}");
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'permiso.laboral.creado';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->permiso->id,
            'nombre' => $this->permiso->nombre,
            'descripcion' => $this->permiso->descripcion,
            'retribuido' => $this->permiso->retribuido,
            'action' => 'created',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}