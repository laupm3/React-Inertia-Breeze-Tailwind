<?php

namespace App\Events\Fichaje;

use App\Models\Horario;
use App\Models\DescansoAdicional;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DescansoFinalizado
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Horario $horario,
        public DescansoAdicional $descanso
    ) {}
} 