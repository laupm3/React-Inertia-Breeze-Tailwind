<?php

namespace App\Services\Team;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Laravel\Jetstream\Jetstream;

class TeamPermissionService
{
    /**
     * Get the permissions for the given team and user.
     *
     * @param Team $team
     * @param User|null $user
     * @return array
     */
    public function getTeamPermissions(Team $team, ?User $user = null): array
    {
        $user = $user ?? Auth::user();

        $permissions = [
            'canAddTeamMembers' => Gate::forUser($user)->allows('addTeamMember', $team),
            'canInviteTeamMembers' => Gate::forUser($user)->allows('inviteTeamMember', $team),
            'canDeleteTeam' => Gate::forUser($user)->allows('delete', $team),
            'canRemoveTeamMembers' => Gate::forUser($user)->allows('removeTeamMember', $team),
            'canUpdateTeam' => Gate::forUser($user)->allows('update', $team),
            'canUpdateTeamMembers' => Gate::forUser($user)->allows('updateTeamMember', $team),
            'canViewTeam' => Gate::forUser($user)->allows('view', $team),
        ];

        return [
            'permissions' => $permissions,
            'availableRoles' => array_values(Jetstream::$roles),
            'availablePermissions' => Jetstream::$permissions,
            'defaultPermissions' => Jetstream::$defaultPermissions,
        ];
    }

    /**
     * Check if the user has specific permission for the team.
     *
     * @param User $user
     * @param Team $team
     * @param string $permission
     * @return bool
     */
    public function hasTeamPermission(User $user, Team $team, string $permission): bool
    {
        return Gate::forUser($user)->allows($permission, $team);
    }
}
