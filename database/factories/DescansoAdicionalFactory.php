<?php

namespace Database\Factories;

use App\Models\DescansoAdicional;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DescansoAdicional>
 */
class DescansoAdicionalFactory extends Factory
{
    protected $model = DescansoAdicional::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'descanso_inicio' => $this->faker->dateTime(),
            'descanso_fin' => $this->faker->dateTime(),
            'latitud_inicio' => $this->faker->latitude,
            'longitud_inicio' => $this->faker->longitude,
            'latitud_fin' => $this->faker->latitude,
            'longitud_fin' => $this->faker->longitude,
            'ip_address_inicio' => $this->faker->ipv4,
            'ip_address_fin' => $this->faker->ipv4,
            'user_agent_inicio' => $this->faker->userAgent,
            'user_agent_fin' => $this->faker->userAgent,
        ];
    }
}