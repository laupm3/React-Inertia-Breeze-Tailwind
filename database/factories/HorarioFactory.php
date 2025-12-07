<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Horario>
 */
class HorarioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Los campos de horarios base serán sobrescritos por el seeder
            'horario_inicio' => null,
            'horario_fin' => null,
            'descanso_inicio' => null,
            'descanso_fin' => null,

            // Los fichajes también serán controlados por el seeder
            'fichaje_entrada' => null,
            'fichaje_salida' => null,

            // Datos de geolocalización solo para fichajes reales
            'latitud_entrada' => $this->faker->optional(0.7)->latitude,
            'longitud_entrada' => $this->faker->optional(0.7)->longitude,
            'latitud_salida' => $this->faker->optional(0.7)->latitude,
            'longitud_salida' => $this->faker->optional(0.7)->longitude,

            // Datos técnicos opcionales
            'user_agent_entrada' => $this->faker->optional(0.8)->userAgent,
            'user_agent_salida' => $this->faker->optional(0.8)->userAgent,
            'ip_address_entrada' => $this->faker->optional(0.8)->ipv4,
            'ip_address_salida' => $this->faker->optional(0.8)->ipv4,

            // Observaciones ocasionales
            'observaciones' => $this->faker->optional(0.1)->sentence,
        ];
    }
}
