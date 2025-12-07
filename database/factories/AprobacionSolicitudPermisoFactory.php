<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AprobacionSolicitudPermiso>
 */
class AprobacionSolicitudPermisoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'observacion' => $this->faker->realText(200),
            'aprobado' => $this->faker->boolean(75),
        ];
    }
}
