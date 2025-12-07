<?php

namespace App\Services;

use App\Models\User;
use App\Models\Inventory\Incident;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class IncidentPermissionService
{
    public function __construct()
    {
        // Initialize service dependencies here
    }

    /**
     * Obtiene los permisos disponibles para el usuario en relacion a las incidencias.
     *
     * @param Incident $incident
     * @param User|null $user
     * @return array
     */
    public function getIncidentPermissions(Incident $incident, ?User $user = null): array
    {
        $user = $user ?? auth()->user();

        $permissions = [
            'canResolveIncident' => Gate::forUser($user)->allows('resolveIncident', $incident),
            'canCancelIncident' => Gate::forUser($user)->allows('cancelIncident', $incident),
            'canAssignIncident' => Gate::forUser($user)->allows('assignIncident', $incident),
            'canViewIncident' => Gate::forUser($user)->allows('viewIncident', $incident),
        ];

        return [
            'permissions' => $permissions,
            'incident' => $incident,
            'user' => $user,
        ];
    }

    /**
     * Verifica si el usuario tiene un permiso específico para la incidencia.
     *
     * @param User $user
     * @param Incident $incident
     * @param string $permission
     * @return bool
     */
    public function hasPermission(User $user, Incident $incident, string $permission): bool
    {
        return Gate::forUser($user)->allows($permission, $incident);
    }
}
