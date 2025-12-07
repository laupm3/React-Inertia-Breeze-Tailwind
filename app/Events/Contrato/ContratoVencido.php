<?php

namespace App\Events\Contrato;

use App\Models\Contrato;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ContratoVencido implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Contrato $contrato;

    /**
     * Create a new event instance.
     *
     * @param Contrato $contrato
     */
    public function __construct(Contrato $contrato)
    {
        $this->contrato = $contrato;

        Log::info('Evento disparado: ContratoVencido', [
            'contrato_id' => $contrato->id,
            'fecha_fin' => $contrato->fecha_fin,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return PrivateChannel
     */
    public function broadcastOn()
    {
        return new PrivateChannel('contratos.vencidos');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'contrato.vencido';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'contrato_id' => $this->contrato->id,
            'dias_restantes' => $this->contrato->diasRestantes(),
            'fecha_fin' => $this->contrato->fecha_fin->format('Y-m-d'),
            'empleado' => $this->getEmpleadoInfo(),
        ];
    }

    private function getEmpleadoInfo(): ?array
    {
        $empleado = $this->contrato->empleado ?? null;

        return $empleado ? [
            'id' => $empleado->id,
            'nombre' => $empleado->nombre,
            'apellido' => $empleado->apellido
        ] : null;
    }
}
