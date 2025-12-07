<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Database\Seeder;
use Laravel\Jetstream\Jetstream;
use Laravel\Jetstream\Actions\UpdateTeamMemberRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        $roles = ['admin', 'editor'];

        // Creamos 50 equipos y asignamos usuarios aleatorios a cada equipo
        $teams = Team::factory(50)->create()->each(function ($team) use ($users, $roles) {

            $owner_id = $team->user_id;

            // Filtramos los usuarios para que no se asigne el dueño del equipo
            $members_to_attach = $users->filter(function ($user) use ($owner_id) {
                return $user->id !== $owner_id;
            });

            $team->users()->attach(
                $members_to_attach->random(rand(3, 10))->pluck('id')->toArray()
            );

            $members = $team->users();

            // Probabilidad de asignar un rol diferente al miembro del equipo
            $members->each(function ($user) use ($team, $roles) {
                if (Arr::random([true, false, false, false])) {
                    $team->users()->updateExistingPivot($user->id, [
                        'role' => Arr::random($roles),
                    ]);
                }
            });

            $members_ids = $members->pluck('id');

            // Tenemos que obtener una cantidad de usuarios aleatorios que no son miembros del equipo
            $users_not_in_team = $users->filter(function ($user) use ($members_ids) {
                return !$members_ids->contains($user->id);
            });

            $users_not_in_team->random(rand(2, 6))->each(function ($user) use ($team) {
                $invitation = $team->teamInvitations()->create([
                    'email' => $user->email,
                    'role' => 'miembro',
                ]);
            });
        });
    }
}
