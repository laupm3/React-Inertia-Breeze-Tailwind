GitHub\React-Inertia-Breeze-Tailwind-Socialite\database\factories\LinkFactory.php
<?php

namespace Database\Factories;

use App\Models\Link;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Link>
 */
class LinkFactory extends Factory
{
    protected $model = Link::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'route_name' => $this->faker->url(),
            'icon' => 'fa-' . $this->faker->word(),
            'weight' => $this->faker->numberBetween(1, 5),
            'is_recent' => $this->faker->boolean(20),
            'is_important' => $this->faker->boolean(10),
            'parent_id' => null,
            'permission_id' => null,
        ];
    }

    /**
     * Marca el enlace como reciente.
     */
    public function recent(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_recent' => true,
        ]);
    }

    /**
     * Marca el enlace como importante.
     */
    public function important(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_important' => true,
        ]);
    }
}
