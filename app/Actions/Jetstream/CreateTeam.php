<?php

namespace App\Actions\Jetstream;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Laravel\Jetstream\Contracts\CreatesTeams;
use Laravel\Jetstream\Events\AddingTeam;
use Laravel\Jetstream\Jetstream;

class CreateTeam implements CreatesTeams
{
    /**
     * Validate and create a new team for the given user.
     *
     * @param  array<string, string>  $input
     */
    public function create(User $user, array $input): Team
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['required', 'string', 'max:50'],
            'icon_color' => ['required', 'string', 'max:50'],
            'bg_color' => ['required', 'string', 'max:50'],
        ])->validateWithBag('createTeam');

        AddingTeam::dispatch($user);

        $team = $user->ownedTeams()->create([
            'name' => $input['name'],
            'description' => $input['description'] ?? '',
            'personal_team' => $input['personal_team'] ?? false,
            'icon' => $input['icon'] ?? 'Rocket',
            'icon_color' => $input['icon_color'] ?? '#f97316',
            'bg_color' => $input['bg_color'] ?? '#102e2e',
        ]);

        return $team;
    }
}
