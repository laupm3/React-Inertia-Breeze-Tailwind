<?php

namespace Database\Factories;

use App\Models\Module;
use App\Models\TipoIncidencia;
use Illuminate\Database\Eloquent\Factories\Factory;

class TipoIncidenciaFactory extends Factory
{
    protected $model = TipoIncidencia::class;

    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'code' => $this->faker->unique()->slug(2),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
} 