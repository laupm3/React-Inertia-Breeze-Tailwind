<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use App\Enums\UserStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'invitado@empresa.com';
        
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Usuario Invitado',
                'password' => Hash::make('Invitado123!'),
                'email_verified_at' => now(),
                'status' => UserStatus::ACTIVE,
            ]
        );

        $user->assignRole('User');

        if (!$user->current_team_id) {
            $team = Team::create([
                'user_id' => $user->id,
                'name' => "Invitado's Team",
                'personal_team' => true,
                'description' => 'Personal team for Guest',
                'icon' => 'Smile',
                'bg_color' => '#10b981',
                'icon_color' => '#ffffff',
            ]);

            $user->current_team_id = $team->id;
            $user->save();
        }
    }
}
