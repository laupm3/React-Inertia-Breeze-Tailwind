<?php

namespace App\Events\Permiso;

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class PermisoCreado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Permission $permiso
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
        // Obtener IDs de usuarios administradores
        $adminUserIds = User::role([
            'Administrator',
            'Super Admin',
            'RRHH',
            'Human Resources',
            'Manager',
            'Team Lead'
        ])->pluck('id');
        $channels = [];
        foreach ($adminUserIds as $userId) {
            $channels[] = new PrivateChannel("App.Models.User.{$userId}");
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'permiso.creado';
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
            'name' => $this->permiso->name,
            'guard_name' => $this->permiso->guard_name,
            'action' => 'created',
        ];
    }
}
