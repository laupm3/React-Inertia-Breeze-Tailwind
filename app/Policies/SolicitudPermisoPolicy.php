<?php

namespace App\Policies;

use App\Enums\TipoAprobacion;
use App\Models\User;
use App\Models\SolicitudPermiso;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;
use Illuminate\Auth\Access\HandlesAuthorization;

class SolicitudPermisoPolicy
{
    use HandlesAuthorization;

    public function __construct(
        private ApprovalService $approvalService,
        private SolicitudPermisoStatusService $statusService
    ) {}

    /**
     * Determina si el usuario puede ver la lista de solicitudes.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('viewWorkPermitRequests', 'web');
    }

    /**
     * Determina si el usuario puede ver una solicitud específica.
     * 
     * Puede ver si:
     * - Tiene permiso de ver solicitudes
     * - Es el empleado que creó la solicitud
     * - Tiene algún permiso de aprobación
     */
    public function view(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return
            $user->hasPermissionTo('viewWorkPermitRequests', 'web') ||
            $solicitudPermiso->empleado_id === $user->empleado?->id ||
            count($this->approvalService->getUserApprovalTypes($user)) > 0;
    }

    /**
     * Determina si el usuario puede crear solicitudes.
     * 
     * ? Nota: Este método no verifica permisos específicos
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determina si el usuario puede actualizar una solicitud.
     * 
     * Puede ver si:
     * - Tiene permiso de edición
     * - O es el creador de la solicitud
     * - Y la solicitud está en estado editable
     */
    public function update(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return (
            $user->hasPermissionTo('editWorkPermitRequests', 'web') ||
            (
                $solicitudPermiso->empleado_id === $user->empleado?->id &&
                $this->statusService->canBeEdited($solicitudPermiso)
            )
        );
    }

    /**
     * Determina si el usuario puede eliminar una solicitud.
     * 
     * - Tiene permiso de eliminación
     * - Es el creador de la solicitud
     * - La solicitud está en estado que permite eliminación
     */
    public function delete(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return (
            $user->hasPermissionTo('deleteWorkPermitRequests', 'web') ||
            (
                $solicitudPermiso->empleado_id === $user->empleado?->id &&
                $this->statusService->canBeDeleted($solicitudPermiso)
            )
        );
    }

    /**
     * Determina si el usuario puede ver el historial de aprobaciones.
     * 
     * - Es el empleado que creó la solicitud
     * - Tiene permiso de ver solicitudes
     * - Tiene algún permiso de aprobación
     */
    public function viewApprovals(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return
            $user->hasPermissionTo('viewWorkPermitRequests', 'web') ||
            $solicitudPermiso->empleado_id === $user->empleado?->id ||
            count($this->approvalService->getUserApprovalTypes($user)) > 0;
    }

    /**
     * Determina si el usuario puede eliminar un archivo (folder) específico de la solicitud de permiso
     */
    public function deleteFile(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        // Reutilizar la lógica del método update ya que los requisitos son los mismos
        return $this->update($user, $solicitudPermiso);
    }

    /**
     * Determina si el usuario puede cancelar una solicitud 
     */
    public function askCancellation(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return (
            $user->hasPermissionTo('editWorkPermitRequests', 'web') ||
            (
                $solicitudPermiso->empleado_id === $user->empleado?->id &&
                $this->statusService->canBeCancelled($solicitudPermiso)
            )
        );
    }

    /**
     * Determina si el usuario puede descargar archivos de la solicitud de permiso
     * 
     * Puede descargar si:
     * - Puede ver la solicitud (reutiliza la lógica de view)
     * - Es el empleado que creó la solicitud
     * - Tiene permisos de administración o aprobación
     */
    public function downloadFiles(User $user, SolicitudPermiso $solicitudPermiso): bool
    {
        return $this->view($user, $solicitudPermiso);
    }
}
