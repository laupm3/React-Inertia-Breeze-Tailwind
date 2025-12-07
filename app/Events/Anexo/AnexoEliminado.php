<?php

namespace App\Events\Anexo;

use App\Models\Anexo;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnexoEliminado
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $anexo;

    public function __construct(Anexo $anexo)
    {
        $this->anexo = $anexo;
    }
}
