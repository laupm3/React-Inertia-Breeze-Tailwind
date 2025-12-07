<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SolicitudPermiso>
 */
class SolicitudPermisoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'motivo' => $this->faker->realText,
            'seen_at' => $this->faker->boolean(25) ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
        ];
    }
}
