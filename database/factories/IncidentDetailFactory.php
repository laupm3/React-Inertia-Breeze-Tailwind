<?php

namespace Database\Factories;

use App\Models\Incident;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IncidentDetail>
 */
class IncidentDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'incident_id' => Incident::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'notes' => $this->faker->optional()->paragraph,
            'relatedDetail_type' => $this->faker->randomElement([
                'App\Models\Product',
                'App\Models\Service',
                'App\Models\Department'
            ]),
            'relatedDetail_id' => $this->faker->numberBetween(1, 10),
        ];
    }
}
