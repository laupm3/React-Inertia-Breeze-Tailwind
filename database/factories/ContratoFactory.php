<?php

namespace Database\Factories;

use App\Models\Anexo;
use App\Models\Jornada;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contrato>
 */
class ContratoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'n_expediente' => $this->faker->unique()->numerify('###/####'),
        ];
    }

    /**
     * Genera un contrato con un anexo. Si se pasa un porcentaje, se crea un anexo con ese porcentaje de probabilidad.
     * 
     * @param array<string, mixed> $attributes
     * @param int|null $chance
     * 
     * @return \App\Models\Contrato
     */
    public function createWithAnexo(array $attributes = [], ?int $chance = 100)
    {
        $contrato = $this->create($attributes);

        $jornadas = Cache::remember('jornadas', now()->addDay(), function () {
            return Jornada::all();
        });

        // Si se pasa un porcentaje, se crea un anexo con ese porcentaje de probabilidad.
        if (rand(1, 100) <= $chance) {
            Anexo::create([
                'contrato_id' => $contrato->id,
                'jornada_id' => $jornadas->random()->id,
                'fecha_inicio' => $attributes['fecha_inicio'] ?? now(),
                'fecha_fin' => $attributes['fecha_fin'] ?? now()->addYear(),
            ]);
        }

        return $contrato;
    }
}
