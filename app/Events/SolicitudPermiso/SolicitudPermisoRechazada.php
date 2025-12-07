<?php

namespace App\Events\SolicitudPermiso;

use App\Models\SolicitudPermiso;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SolicitudPermisoRechazada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public SolicitudPermiso $solicitudPermiso,
        public string $tipoAprobacion,
        public ?string $observacion
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // Obtener ID del empleado solicitante para notificar
        $empleadoUserId = $this->solicitudPermiso->empleado->user->id;

        // Obtener IDs de usuarios con permiso de ver solicitudes
        $userIds = User::permission('viewWorkPermitRequests')
            ->where('id', '!=', $empleadoUserId) // Excluir al solicitante, tiene su propio canal
            ->pluck('id')
            ->toArray();

        // Obtener IDs de managers
        $managerIds = User::role(['Manager', 'Team Lead'])
            ->where('id', '!=', $empleadoUserId)
            ->pluck('id')
            ->toArray();

        // Combinar todos los IDs únicos
        $allUserIds = array_unique(array_merge($userIds, $managerIds, [$empleadoUserId]));

        $channels = [];
        foreach ($allUserIds as $userId) {
            $channels[] = new PrivateChannel("App.Models.User.{$userId}");
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'solicitud.permiso.rechazada';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->solicitudPermiso->id,
            'empleado' => [
                'id' => $this->solicitudPermiso->empleado->id,
                'nombre' => $this->solicitudPermiso->empleado->nombre_completo
            ],
            'permiso' => [
                'id' => $this->solicitudPermiso->permiso->id,
                'nombre' => $this->solicitudPermiso->permiso->nombre
            ],
            'fecha_inicio' => $this->solicitudPermiso->fecha_inicio->toIso8601String(),
            'fecha_fin' => $this->solicitudPermiso->fecha_fin->toIso8601String(),
            'tipo_aprobacion' => $this->tipoAprobacion,
            'observacion' => $this->observacion,
            'action' => 'rejected',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
