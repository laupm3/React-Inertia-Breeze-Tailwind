<?php

namespace App\Http\Controllers\User;

use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Services\Team\TeamPermissionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Laravel\Jetstream\Jetstream;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;
use Laravel\Jetstream\RedirectsActions;
use Laravel\Jetstream\Contracts\CreatesTeams;
use Laravel\Jetstream\Contracts\DeletesTeams;
use Laravel\Jetstream\Contracts\UpdatesTeamNames;
use Laravel\Jetstream\Actions\ValidateTeamDeletion;

class TeamController extends Controller
{
    use RedirectsActions;

    use AuthorizesRequests;

    /**
     * Service to get the permissions for teams.
     */
    protected TeamPermissionService $teamPermissionService;

    /**
     * Create a new controller instance.
     *
     * @param TeamPermissionService $teamPermissionService
     * @return void
     */
    public function __construct(TeamPermissionService $teamPermissionService)
    {
        $this->teamPermissionService = $teamPermissionService;
    }

    /**
     * Show the team management screen for the given team.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team $team
     * 
     * @return \Inertia\Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function show(Request $request, Team $team)
    {
        Gate::authorize('view', $team);

        return Jetstream::inertia()->render($request, 'Teams/CreateUpdate', [
            'teamId' => $team->id,
        ]);
    }

    /**
     * Show the team creation screen.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(Request $request)
    {
        Gate::authorize('create', Jetstream::newTeamModel());

        return Jetstream::inertia()->render($request, 'Teams/CreateUpdate', [
            'team' => null
        ]);
    }

    /**
     * Store a newly created team in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified team in storage.
     */
    public function update(Request $request, Team $team)
    {
        //
    }

    /**
     * Remove the specified team from storage.
     */
    public function destroy(Request $request, Team $team)
    {
        //
    }
}
