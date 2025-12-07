<?php

namespace App\Http\Controllers\User;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TeamMemberController extends Controller
{
    /**
     * Add a new team member to a team.
     */
    public function store(Request $request, Team $team)
    {
        //
    }

    /**
     * Update the given team member's role.
     */
    public function update(Request $request, Team $team, User $user)
    {
        //
    }

    /**
     * Remove the given user from the given team.
     */
    public function destroy(Request $request, Team $team, User $user)
    {
        //
    }
}
