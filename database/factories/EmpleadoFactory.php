<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Empleado>
 */
class EmpleadoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->firstName,
            'primer_apellido' => $this->faker->lastName,
            'segundo_apellido' => $this->faker->lastName,
            'nif' => $this->faker->dni,
            'caducidad_nif' => $this->faker->dateTimeBetween('now', '+1 year'),
            'email' => $this->faker->unique()->safeEmail,
            'email_secundario' => $this->faker->unique()->safeEmail,
            'telefono' => $this->faker->phoneNumber,
            'telefono_personal_movil' => $this->faker->phoneNumber,
            'telefono_personal_fijo' => $this->faker->phoneNumber,
            'extension_centrex' => $this->faker->phoneNumber,
            'fecha_nacimiento' => $this->faker->date(),
            'niss' => $this->faker->unique()->isbn10,
            'contacto_emergencia' => $this->faker->name,
            'telefono_emergencia' => $this->faker->phoneNumber,
            'observaciones_salud' => $this->faker->optional(0.3)->paragraph(2), // 30% de probabilidad de tener observaciones
        ];
    }
}
