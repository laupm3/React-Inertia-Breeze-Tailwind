<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     * 
     * This method allows admin users to view the teams panel.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('viewTeamsPanel', 'web');
    }

    /**
     * Determine whether the user can view the model.
     * 
     * This method checks if the user has permission to view teams or if they belong to the specified team.
     */
    public function view(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('viewTeams', 'web') || $user->belongsToTeam($team);
    }

    /**
     * Determine whether the user can create models.
     * 
     * By default, any authenticated user can create a team.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * 
     * This method allows users to update teams if they have the 'updateTeams' permission or if they own the team.
     */
    public function update(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('updateTeams', 'web') || $user->hasTeamPermission($team, 'edit');
    }

    /**
     * Determine whether the user can add team members.
     * 
     * This method allows users to add team members if they have the 'addUsersToTeams' permission or if they have the 'addTeamMember' permission for the specified team.
     */
    public function addTeamMember(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('addUsersToTeams', 'web') || $user->hasTeamPermission($team, 'addTeamMember');
    }

    /**
     * Determine whether the user can invite team members.
     * 
     * This method allows users to invite team members if they have the 'inviteUsersToTeams' permission or if they have the 'inviteTeamMember' permission for the specified team.
     */
    public function inviteTeamMember(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('invitateUsersToTeams', 'web') || $user->hasTeamPermission($team, 'inviteTeamMember');
    }

    /**
     * Determine whether the user can update team member permissions.
     * 
     * This method allows users to update team member permissions if they have the 'updateUsersFromTeams' permission or if they have the 'updateTeamMember' permission for the specified team.
     */
    public function updateTeamMember(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('updateUsersFromTeams', 'web') || $user->hasTeamPermission($team, 'updateTeamMember');
    }

    /**
     * Determine whether the user can remove team members.
     * 
     * This method allows users to remove team members if they have the 'removeUsersFromTeams' permission or if they have the 'removeTeamMember' permission for the specified team.
     */
    public function removeTeamMember(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('removeUsersFromTeams', 'web') || $user->hasTeamPermission($team, 'removeTeamMember');
    }

    /**
     * Determine whether the user can delete the model.
     * 
     * This method allows users to delete teams if they have the 'deleteTeams' permission or if they have the 'delete' permission for the specified team.
     */
    public function delete(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('deleteTeams', 'web') || $user->hasTeamPermission($team, 'delete');
    }
}
