<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Turno>
 */
class TurnoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name,
            'descripcion' => $this->faker->sentence,
            'hora_inicio' => $this->faker->time(),
            'hora_fin' => $this->faker->time(),
            'descanso_inicio' => $this->faker->time(),
            'descanso_fin' => $this->faker->time(),
        ];
    }
}
