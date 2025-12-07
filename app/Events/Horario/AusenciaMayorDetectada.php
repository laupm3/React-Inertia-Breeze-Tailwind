<?php

namespace App\Events\Horario;

use App\Models\Horario;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AusenciaMayorDetectada implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public Horario $horario;
    public int $minutosRetraso;

    /**
     * Create a new event instance.
     *
     * @param Horario $horario
     * @param int $minutosRetraso
     */
    public function __construct(Horario $horario, int $minutosRetraso)
    {
        $this->horario = $horario;
        $this->minutosRetraso = $minutosRetraso;

        Log::info('Evento disparado: RetrasoDetectado o AusenciaMayorDetectada', [
            'horario_id' => $horario->id,
            'minutos_retraso' => $minutosRetraso,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('horario.ausencias');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'horario.ausencia';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'horario_id' => $this->horario->id,
            'minutos_retraso' => $this->minutosRetraso,
            'requiere_justificante' => true,
            'timestamp' => now()->toIso8601String(),
            'empleado' => $this->getEmpleadoInfo(),
        ];
    }

    private function getEmpleadoInfo(): ?array
    {
        $empleado = null;

        if ($this->horario->contrato_id) {
            $empleado = $this->horario->contrato->empleado ?? null;
        } elseif ($this->horario->anexo_id) {
            $empleado = $this->horario->anexo->contrato->empleado ?? null;
        }

        return $empleado ? [
            'id' => $empleado->id,
            'nombre' => $empleado->nombre,
            'apellido' => $empleado->apellido
        ] : null;
    }
}
