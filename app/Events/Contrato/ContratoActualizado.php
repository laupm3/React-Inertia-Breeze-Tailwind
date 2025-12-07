<?php

namespace App\Events\Contrato;

use App\Models\Contrato;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContratoActualizado
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El contrato que se ha actualizado.
     */
    public $contrato;
    
    /**
     * Los valores originales antes de actualizar.
     */
    public $original;

    /**
     * Create a new event instance.
     */
    public function __construct(Contrato $contrato, array $original = [])
    {
        $this->contrato = $contrato;
        $this->original = $original;
    }
}