<?php

namespace App\Events\Contrato;

use App\Models\Contrato;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ContratoProximoAVencer implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Contrato $contrato;
    public int $diasRestantes;

    /**
     * Create a new event instance.
     *
     * @param Contrato $contrato
     * @param int $diasRestantes
     */
    public function __construct(Contrato $contrato, int $diasRestantes)
    {
        $this->contrato = $contrato;
        $this->diasRestantes = $diasRestantes;

        Log::info('Evento disparado: ContratoProximoAVencer', [
            'contrato_id' => $contrato->id,
            'dias_restantes' => $diasRestantes,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return PrivateChannel
     */
    public function broadcastOn()
    {
        return new PrivateChannel('contratos.proximos-a-vencer');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'contrato.proximo-a-vencer';
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
            'dias_restantes' => $this->diasRestantes,
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
