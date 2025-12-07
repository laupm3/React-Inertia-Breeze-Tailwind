<?php

namespace App\Events\Contrato;

use App\Models\Contrato;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContratoCreado
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El contrato que se ha creado.
     */
    public $contrato;

    /**
     * Create a new event instance.
     */
    public function __construct(Contrato $contrato)
    {
        $this->contrato = $contrato;
    }
}