<?php

namespace App\Services;

use App\Models\SolicitudPermiso;
use App\Models\EstadoSolicitudPermiso;
use App\Enums\TipoAprobacion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Dedicated service for tracking the first view of a permission request.
 */
class ViewTrackingService
{
    /**
     * Register the first view of a request by a user with permissions.
     *
     * @param SolicitudPermiso $solicitud
     * @return bool
     */
    public function trackFirstView(SolicitudPermiso $solicitud): bool
    {
        // Verify if the request has already been seen or if the user is not authenticated
        if ($solicitud->seen_at || !Auth::check()) {
            return false;
        }

        $user = Auth::user();

        // Verificar si el usuario tiene algún permiso de aprobación
        $tienePermiso = $this->userHasApprovalPermission($user);

        if (!$tienePermiso) {
            return false;
        }

        // Obtener el estado "En revisión"
        $estadoEnRevision = $this->getEstadoRevision();

        if (!$estadoEnRevision) {
            Log::warning('No se encontró el estado "En revisión" para las solicitudes de permiso');
            return false;
        }

        // Actualizar la solicitud
        $solicitud->seen_at = now();
        $solicitud->seen_by_user_id = $user->id;
        $solicitud->estado_id = $estadoEnRevision->id;
        $solicitud->save();

        Log::info("Solicitud {$solicitud->id} marcada como vista por el usuario {$user->id}");

        return true;
    }

    /**
     * Verifica si un usuario tiene algún permiso de aprobación.
     *
     * @param mixed $user
     * @return bool
     */
    protected function userHasApprovalPermission($user): bool
    {
        $requiredPermissions = TipoAprobacion::getPermissionNames();

        foreach ($requiredPermissions as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obtiene el estado "En revisión".
     *
     * @return EstadoSolicitudPermiso|null
     */
    protected function getEstadoRevision()
    {
        return EstadoSolicitudPermiso::where('nombre', 'En revisión')->first();
    }
}
