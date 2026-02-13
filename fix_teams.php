<?php

use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = User::all();

foreach ($users as $user) {
    if (!$user->current_team_id) {
        echo "Fixing user: {$user->email}\n";
        
        $team = Team::where('user_id', $user->id)->first();
        
        if (!$team) {
            $team = Team::create([
                'user_id' => $user->id,
                'name' => explode(' ', $user->name)[0] . "'s Team",
                'personal_team' => true,
                'description' => 'Personal team for ' . $user->name,
                'icon' => 'Smile',
                'bg_color' => '#4f46e5',
                'icon_color' => '#ffffff',
            ]);
        }
        
        $user->current_team_id = $team->id;
        $user->save();
        
        // Ensure user is a member of their own team if not owner (Jetstream logic varies)
        if (!DB::table('team_user')->where('team_id', $team->id)->where('user_id', $user->id)->exists()) {
             // For personal teams, the owner doesn't always need a pivot entry depending on how current_team is handled, 
             // but let's ensure it's robust.
        }
    } else {
        // Ensure team has properties
        $team = $user->current_team;
        if ($team && (!$team->bg_color || !$team->icon)) {
            echo "Updating team properties for user: {$user->email}\n";
            $team->update([
                'icon' => $team->icon ?? 'Smile',
                'bg_color' => $team->bg_color ?? '#4f46e5',
                'icon_color' => $team->icon_color ?? '#ffffff',
            ]);
        }
    }
}

echo "Done!\n";
