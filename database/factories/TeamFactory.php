<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string,
     *  'mixed'>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company,
            'description' => $this->faker->realText,
            'user_id' => User::factory(),
            'personal_team' => true,
            'icon' => Arr::random([
                'Smile',
                'Swords',
                'Banana',
                'Beef',
                'Bone',
                'HandMetal',
                'Brush',
                'Coffee',
                'ChartBar',
                'Send',
                'Zap',
                'Rocket',
                'House',
                'Cookie',
                'CodeXml',
                'Box',
                'Clapperboard',
                'Backpack',
                'Webhook',
                'Lightbulb',
                'Flame'
            ]),
            'icon_color' => $this->faker->hexColor(),
            'bg_color' => $this->faker->hexColor(),
        ];
    }
}
