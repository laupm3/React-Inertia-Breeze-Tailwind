<?php

namespace App\Events\Horario;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HorarioActualizado implements ShouldBroadcast
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
        return 'horario.actualizado';
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
            'accion' => 'updated',
            'mensaje' => 'Se ha actualizado un horario',
            'timestamp' => now()->toIso8601String(),
            'empleado' => $this->getEmpleadoInfo(),
            'centro' => $this->getCentroInfo()
        ];
    }

    private function getEmpleadoInfo(): ?array
    {
        $empleado = $this->horario->empleado ?? null;
        return $empleado ? [
            'id' => $empleado->id,
            'nombre' => $empleado->nombre,
            'apellido' => $empleado->apellido
        ] : null;
    }

    private function getCentroInfo(): ?array
    {
        $centro = $this->horario->centro ?? null;
        return $centro ? [
            'id' => $centro->id,
            'nombre' => $centro->nombre
        ] : null;
    }
}