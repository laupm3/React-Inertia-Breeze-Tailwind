<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\TipoIncidencia;
use App\Enums\PriorityLevel;
use App\Enums\IncidentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Incident>
 */
class IncidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference_number' => 'INC-' . $this->faker->unique()->numerify('######'),
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'reported_by_id' => User::factory(),
            'tipo_incidencia_id' => TipoIncidencia::factory()->create()->id,
            'status' => $this->faker->randomElement(IncidentStatus::cases()),
            'priority' => $this->faker->randomElement(PriorityLevel::cases()),
            'reported_at' => now(),
            'assigned_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 week', 'now'),
            'resolved_at' => $this->faker->optional(0.3)->dateTimeBetween('-3 days', 'now'),
            'due_date' => $this->faker->optional(0.8)->dateTimeBetween('now', '+2 weeks'),
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the incident is pending review.
     *
     * @return $this
     */
    public function pendingReview()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => IncidentStatus::PENDING_REVIEW,
                'assigned_at' => null,
                'assigned_to_id' => null,
                'resolved_at' => null,
                'resolved_by_id' => null,
            ];
        });
    }

    /**
     * Indicate that the incident is in progress.
     *
     * @return $this
     */
    public function inProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => IncidentStatus::IN_PROGRESS,
                'assigned_at' => now(),
                'assigned_to_id' => User::factory(),
                'resolved_at' => null,
                'resolved_by_id' => null,
            ];
        });
    }

    /**
     * Indicate that the incident is resolved.
     *
     * @return $this
     */
    public function resolved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => IncidentStatus::RESOLVED,
                'assigned_at' => now()->subDays(2),
                'assigned_to_id' => User::factory(),
                'resolved_at' => now(),
                'resolved_by_id' => User::factory(),
            ];
        });
    }
}
