<?php

namespace Database\Factories;

use App\Models\NivelSeguridad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NivelSeguridad>
 */
class NivelSeguridadFactory extends Factory
{
    protected $model = NivelSeguridad::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->word,
            'descripcion' => $this->faker->sentence,
        ];
    }
}
