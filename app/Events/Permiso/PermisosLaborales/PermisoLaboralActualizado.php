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

class PermisoLaboralActualizado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Permiso $permiso,
        public array $cambios = []
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
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
        return 'permiso.laboral.actualizado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->permiso->id,
            'nombre' => $this->permiso->nombre,
            'descripcion' => $this->permiso->descripcion,
            'retribuido' => $this->permiso->retribuido,
            'cambios' => $this->cambios,
            'action' => 'updated',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}