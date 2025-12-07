<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Direccion>
 */
class DireccionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a latitude and longitude for the center in Spain - Madrid
        $latitude = $this->faker->latitude(40.4168, 40.489673);
        $longitude = $this->faker->longitude(-3.70379, -3.800875);

        return [
            'full_address' => $this->faker->address,
            'latitud' =>  $latitude,
            'longitud' => $longitude,
            'codigo_postal' => $this->faker->postcode,
            'numero' => $this->faker->buildingNumber,
            'piso' => $this->faker->randomElement(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
            'puerta' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
            'bloque' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
            'escalera' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
        ];
    }
}
