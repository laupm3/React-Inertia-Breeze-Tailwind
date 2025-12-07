<?php

namespace App\Events\Contrato;

use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;

class EmpleadoSinContratosVigentes implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $empleadoId;

    /**
     * Create a new event instance.
     *
     * @param int $empleadoId
     */
    public function __construct(int $empleadoId)
    {
        $this->empleadoId = $empleadoId;

        Log::info('Evento disparado: EmpleadoSinContratosVigentes', [
            'empleado_id' => $empleadoId,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return PrivateChannel
     */
    public function broadcastOn()
    {
        return new PrivateChannel('contratos.empleados-sin-contratos');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'contrato.empleado-sin-contratos';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'empleado_id' => $this->empleadoId,
        ];
    }
}
