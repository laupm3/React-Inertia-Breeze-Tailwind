<?php

namespace Database\Factories;

use App\Models\Empleado;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Empresa>
 */
class EmpresaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'representante_id' => Empleado::factory(),
            'adjunto_id' => Empleado::factory(),
            'direccion_id' => 1, // Asume que tienes direcciones predefinidas
            'nombre' => $this->faker->company,
            'siglas' => $this->faker->companySuffix,
            'cif' => $this->faker->unique()->vat,
            'email' => $this->faker->companyEmail,
            'telefono' => $this->faker->phoneNumber,
        ];
    }
}
