<?php

namespace App\Events\Turno;

use App\Models\Turno;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TurnoEliminado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Turno $turno
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
        $channels = [];

        $users = $this->getRelevantUsers();

        foreach ($users as $user) {
            $channels[] = new PrivateChannel('App.Models.User.' . $user->id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'turno.eliminado';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->turno->id,
            'hora_inicio' => $this->turno->hora_inicio,
            'hora_fin' => $this->turno->hora_fin,
            'accion' => 'deleted',
            'mensaje' => 'Se ha eliminado un turno',
            'timestamp' => now()->toIso8601String(),
            'empleado' => $this->getEmpleadoInfo(),
            'centro' => $this->getCentroInfo()
        ];
    }

    /**
     * Obtiene todos los usuarios relevantes para este evento
     */
    private function getRelevantUsers(): array
    {
        $users = [];

        $users = array_merge($users, $this->turno->usuarios()->all());

        $admins = \App\Models\User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['Administrator', 'Super Admin']);
        })->get();
        $users = array_merge($users, $admins->all());

        $hr = \App\Models\User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['Recursos Humanos']);
        })->get();
        $users = array_merge($users, $hr->all());

        $uniqueUsers = [];
        foreach ($users as $user) {
            $uniqueUsers[$user->id] = $user;
        }

        return array_values($uniqueUsers);
    }

    /**
     * Obtiene información del empleado asociado
     */
    private function getEmpleadoInfo(): ?array
    {
        $empleado = null;
        if ($this->turno->contrato_id && $this->turno->contrato->empleado) {
            $empleado = $this->turno->contrato->empleado;
        } elseif ($this->turno->anexo_id && $this->turno->anexo->contrato->empleado) {
            $empleado = $this->turno->anexo->contrato->empleado;
        }

        return $empleado ? [
            'id' => $empleado->id,
            'nombre' => $empleado->nombre,
            'apellido' => $empleado->apellido
        ] : null;
    }

    /**
     * Obtiene información del centro
     */
    private function getCentroInfo(): ?array
    {
        $centro = null;
        if ($this->turno->contrato_id && $this->turno->contrato->centro) {
            $centro = $this->turno->contrato->centro;
        } elseif ($this->turno->anexo_id && $this->turno->anexo->contrato->centro) {
            $centro = $this->turno->anexo->contrato->centro;
        }

        return $centro ? [
            'id' => $centro->id,
            'nombre' => $centro->nombre
        ] : null;
    }
}
