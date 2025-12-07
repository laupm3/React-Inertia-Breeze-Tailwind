<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $notifiableTypes = [
            \App\Models\Contrato::class,
            \App\Models\User::class,
            \App\Models\Empleado::class,
        ];

        $actions = ['created', 'updated', 'deleted', 'expired', 'renewed'];
        
        $notifiableType = $this->faker->randomElement($notifiableTypes);
        $notifiableId = null;
        
        // Intentar obtener un ID real
        try {
            $model = $notifiableType::inRandomOrder()->first();
            if ($model) {
                $notifiableId = $model->id;
            }
        } catch (\Exception $e) {
            // Si falla, usar un ID aleatorio
            $notifiableId = $this->faker->numberBetween(1, 100);
        }

        return [
            'sender_id' => User::factory(),
            'receiver_id' => User::factory(),
            'notifiable_type' => $notifiableType,
            'notifiable_id' => $notifiableId,
            'action' => $this->faker->randomElement($actions),
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'data' => [
                'action_url' => $this->faker->url,
                'action_text' => $this->faker->word,
            ],
            'is_read' => $this->faker->boolean,
            'read_at' => $this->faker->optional(0.3)->dateTime,
            'sent_at' => $this->faker->dateTime,
            'received_at' => $this->faker->optional(0.7)->dateTime,
        ];
    }
}
