<?php

namespace Database\Factories;

use App\Models\Anexo;
use App\Models\Contrato;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnexoFactory extends Factory
{
    protected $model = Anexo::class;

    public function definition()
    {
        return [
            'contrato_id' => Contrato::factory(),
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addYear(),
        ];
    }
}
