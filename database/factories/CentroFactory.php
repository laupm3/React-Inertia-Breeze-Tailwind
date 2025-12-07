<?php

namespace Database\Factories;

use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\EstadoCentro;
use App\Models\Direccion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Centro>
 */
class CentroFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Obtener datos de otras tablas necesarias para las relaciones
        $empresa = Empresa::inRandomOrder()->first();
        $responsable = Empleado::whereHas('tipoEmpleado', function ($query) {
            $query->whereIn('nombre', ['Director', 'Manager']);
        })->inRandomOrder()->first();

        $coordinador = Empleado::whereHas('tipoEmpleado', function ($query) {
            $query->whereIn('nombre', ['Director', 'Manager']);
        })
            ->where('id', '!=', $responsable->id)
            ->inRandomOrder()
            ->first();

        $estadoCentro = EstadoCentro::inRandomOrder()->first();
        $direccion = Direccion::factory()->create();

        return [
            'empresa_id' => $empresa->id,
            'responsable_id' => $responsable->id,
            'coordinador_id' => $coordinador->id,
            'estado_id' => $estadoCentro->id,
            'direccion_id' => $direccion->id,
            'nombre' => $this->faker->company,
            'email' => $this->faker->unique()->companyEmail,
            'telefono' => $this->faker->phoneNumber
        ];
    }
}
