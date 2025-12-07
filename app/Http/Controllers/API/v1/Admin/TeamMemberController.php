<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Http\Requests\Team\TeamMemberDestroyRequest;
use App\Http\Requests\Team\TeamMemberStoreRequest;
use App\Http\Requests\Team\TeamMemberUpdateRequest;
use App\Http\Resources\TeamResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;

class TeamMemberController extends Controller
{
    use AuthorizesRequests;

    /**
     * Add or invite members to the team as a member
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Team  $team
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(TeamMemberStoreRequest $request, Team $team)
    {
        if (Gate::allows('addTeamMember', $team)) {
            app(\App\Actions\Jetstream\AddTeamMember::class)->addMembers(
                $team,
                $request->emails ?: [],
                $request->role
            );
        } elseif (Gate::allows('inviteTeamMember', $team)) {
            app(\App\Actions\Jetstream\InviteTeamMember::class)->inviteMembers(
                $team,
                $request->emails ?: [],
                $request->role
            );
        } else {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para añadir o invitar miembros al equipo.'
            ]);
        }

        $team->load(Team::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'team' => new TeamResource($team)
        ]);
    }

    /**
     * Update the given team member's role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team The team to which the member belongs
     * @param  User  $user The user whose role is being updated
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(TeamMemberUpdateRequest $request, Team $team, User $user)
    {
        if (!Gate::allows('updateTeamMember', $team)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para actualizar los miembros del equipo.'
            ]);
        }

        app(\App\Actions\Jetstream\UpdateTeamMemberRole::class)->update(
            $team,
            $user->id,
            $request->role
        );

        $team->load(Team::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'team' => new TeamResource($team)
        ]);
    }

    /**
     * Remove the given user from the given team.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Team  $team The team to which the member belongs
     * @param  User  $user The user whose role is being updated
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(TeamMemberDestroyRequest $request, Team $team, User $user)
    {
        if (!Gate::allows('removeTeamMember', $team)) {
            return response()->json(status: Response::HTTP_FORBIDDEN, data: [
                'message' => 'No tienes permiso para eliminar a los miembros del equipo.'
            ]);
        }

        app(\App\Actions\Jetstream\RemoveTeamMember::class)->remove(
            $team,
            $user
        );

        $team->load(Team::RELATIONSHIPS);

        return response()->json(status: Response::HTTP_OK, data: [
            'message' => 'Miembro del equipo eliminado correctamente.',
            'team' => new TeamResource($team)
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Team $team)
    {
        //
    }
}
