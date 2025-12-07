<?php

namespace App\Services\SolicitudPermiso;

use App\Models\User;
use Illuminate\Support\Arr;
use App\Enums\TipoAprobacion;
use App\Models\AprobacionSolicitudPermiso;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Expr\ArrayItem;

class ApprovalService
{
    /**
     * Procesa una aprobación considerando la jerarquía
     * 
     * @param SolicitudPermiso $solicitud 
     * @param TipoAprobacion $tipoAprobacion - El tipo de aprobación que se está procesando
     * @param User $user - El usuario que está realizando la aprobación
     * @param bool $aprobado - Indica si la solicitud fue aprobada o rechazada
     * @param string|null $observacion - Observaciones adicionales sobre la aprobación
     * @return bool
     */
    public function processHierarchicalApproval(
        SolicitudPermiso  $solicitud,
        TipoAprobacion $tipoAprobacion,
        User $user,
        bool $aprobado,
        ?string $observacion = null
    ): bool {
        // Crear la aprobación directa
        $aprobacion = AprobacionSolicitudPermiso::create([
            'solicitud_permiso_id' => $solicitud->id,
            'user_id' => $user->id,
            'tipo_aprobacion' => $tipoAprobacion->value,
            'aprobado' => $aprobado,
            'observacion' => $observacion,
            'is_automatic' => false,
        ]);

        if (!$aprobacion) {
            Log::error('Error al crear la aprobación', [
                'solicitud_id' => $solicitud->id,
                'tipo_aprobacion' => $tipoAprobacion->value,
                'user_id' => $user->id,
            ]);

            throw new \RuntimeException('Error al crear la aprobación.');
        }

        // Si es rechazo, no procesamos jerarquía
        if (!$aprobado) {
            return true;
        }

        // Crear aprobaciones automáticas para niveles inferiores
        $this->createAutomaticApprovals($solicitud, $tipoAprobacion, $user);

        return true;
    }

    /**
     * Crea aprobaciones automáticas para niveles inferiores en la jerarquía
     * 
     * Este método crea aprobaciones automáticas para todos los niveles inferiores
     * en la jerarquía del tipo de aprobación actual. Si ya existe una aprobación
     * para un nivel inferior, no se crea una nueva.
     * 
     * @param SolicitudPermiso $solicitud
     * @param TipoAprobacion $tipoAprobacion - El tipo de aprobación que se está procesando
     * @param User $user - El usuario que está realizando la aprobación
     * @return void
     */
    private function createAutomaticApprovals(
        SolicitudPermiso $solicitud,
        TipoAprobacion $tipoAprobacion,
        User $user
    ): void {
        $lowerLevels = $tipoAprobacion->getLowerHierarchyLevels();

        foreach ($lowerLevels as $lowerLevel) {
            // Verificar si ya existe una aprobación para este nivel
            $existingApproval = $solicitud->aprobaciones()
                ->where('tipo_aprobacion', $lowerLevel->value)
                ->first();

            if (!$existingApproval) {
                AprobacionSolicitudPermiso::create([
                    'solicitud_permiso_id' => $solicitud->id,
                    'user_id' => $user->id,
                    'tipo_aprobacion' => $lowerLevel->value,
                    'aprobado' => true,
                    'comentarios' => "Aprobación automática por: " . $user->name,
                    'is_automatic' => true,
                ]);
            }
        }
    }

    /**
     * Verifica si un usuario puede aprobar con un tipo específico
     * 
     * @param User $user
     * @param TipoAprobacion $tipoAprobacion
     * @return bool
     */
    public function canUserApprove(User $user, TipoAprobacion $tipoAprobacion): bool
    {
        return $user->hasPermissionTo($tipoAprobacion->getPermissionName(), 'web');
    }

    /**
     * Obtiene los tipos de aprobación que puede realizar un usuario
     * 
     * @param User $user
     * @return array<TipoAprobacion>
     */
    public function getUserApprovalTypes(User $user): array
    {
        return Arr::where(TipoAprobacion::getApprovals(), function ($tipo) use ($user) {
            return $user->hasPermissionTo($tipo->getPermissionName(), 'web');
        });
    }

    /**
     * Obtiene el resumen de aprobaciones (total, completadas, pendientes y porcentaje)
     * 
     * @param SolicitudPermiso $solicitud
     * @return array<string, mixed>
     */
    public function getApprovalSummary(SolicitudPermiso &$solicitud): array
    {
        // Check if aprobaciones relationship is loaded
        if (!$solicitud->relationLoaded('aprobaciones')) {
            $solicitud->load('aprobaciones');
        }

        $approvals = $solicitud->aprobaciones;
        $requiredApprovals = TipoAprobacion::getAllValues();
        $totalRequired = count($requiredApprovals);
        $completedApprovals = $approvals->where('aprobado', true)->count();
        $rejectedApprovals = $approvals->where('aprobado', false)->count();
        $highestApprovalLevel = $this->getHighestApprovalLevel($approvals);

        return [
            'approvals' => $approvals,
            'total_required' => count($requiredApprovals),
            'required_approvals' => $requiredApprovals,
            'completed_approvals' => $completedApprovals,
            'fully_approved' => count($requiredApprovals) === $completedApprovals,
            'rejected_approvals' => $rejectedApprovals,
            'rejected' => $rejectedApprovals > 0,
            'percentage' => $requiredApprovals > 0 ? round(($completedApprovals / $totalRequired) * 100, 2) : 0,
            'highest_approval_level' => $highestApprovalLevel,
            'approval_details' => $this->getApprovalDetails($approvals),
            'is_cancelled' => $solicitud->is_cancelled,
        ];
    }

    /**
     * Obtiene el nivel más alto de aprobación
     * 
     * @param \Illuminate\Support\Collection<AprobacionSolicitudPermiso> $approvals
     */
    private function getHighestApprovalLevel($approvals): ?TipoAprobacion
    {
        $approvedTypes = $approvals->where('aprobado', true)
            ->pluck('tipo_aprobacion')
            ->map(fn($type) => TipoAprobacion::from($type))
            ->sortByDesc(fn($type) => $type->getOrder());

        return $approvedTypes->first();
    }

    /**
     * Obtienes el nivel de aprobación más alto que un usuario ha otorgado
     * 
     * @param User $user
     * @return TipoAprobacion|null
     */
    public function getUserHighestApprovalLevel(User $user): TipoAprobacion
    {
        $userApprovals = $this->getUserApprovalTypes($user);

        return collect($userApprovals)
            ->sortByDesc(fn($type) => $type->getOrder())
            ->first();
    }

    /**
     * Obtiene detalles de las aprobaciones separando manuales de automáticas
     */
    private function getApprovalDetails($approvals): array
    {
        $manual = $approvals->where('is_automatic', false);
        $automatic = $approvals->where('is_automatic', true);

        return [
            'manual_approvals' => $manual->values(),
            'automatic_approvals' => $automatic->values(),
            'manual_count' => $manual->count(),
            'automatic_count' => $automatic->count(),
        ];
    }

    /**
     * Verifica si un usuario puede aprobar una solicitud específica
     * 
     * Si el usuario no tiene el permiso necesario, retorna false.
     * 
     * Si el tipo de aprobación ya ha sido otorgado, también retorna false.
     * 
     * @param User $user
     * @param SolicitudPermiso $solicitud
     * @param TipoAprobacion $tipoAprobacion
     * @return bool
     */
    public function canUserApproveRequest(User $user, SolicitudPermiso $solicitud, TipoAprobacion $tipoAprobacion): bool
    {
        // Verificar permisos básicos
        if (!$this->canUserApprove($user, $tipoAprobacion)) {
            return false;
        }

        // Verificar si ya existe una aprobación para este tipo
        $existingApproval = $solicitud->aprobaciones()
            ->where('tipo_aprobacion', $tipoAprobacion->value)
            ->first();

        return !$existingApproval;
    }

    /**
     * Obtiene los tipos de aprobación pendientes para una solicitud
     * 
     * Este método retorna los tipos de aprobación que aún no han sido otorgados
     * para una solicitud específica. Utiliza los tipos de aprobación definidos en el enum
     * TipoAprobacion y filtra aquellos que ya han sido aprobados.
     * 
     * @param SolicitudPermiso $solicitud
     * @return array<TipoAprobacion>
     */
    public function getPendingApprovalTypes(SolicitudPermiso $solicitud): array
    {
        $existingApprovals = $solicitud->aprobaciones->pluck('tipo_aprobacion')->toArray();
        $allTypes = TipoAprobacion::getAllValues();

        return array_diff($allTypes, $existingApprovals);
    }

    /**
     * Obtiene los tipos de aprobación que un usuario puede ejecutar para una solicitud específica
     * 
     * Este método filtra los tipos de aprobación que un usuario puede ejecutar
     * basándose en los permisos del usuario y los tipos de aprobación pendientes para la solicitud.    
     * 
     * @param User $user
     * @param SolicitudPermiso $solicitud
     * @return array<TipoAprobacion>
     */
    public function getUserAvailableApprovalTypes(User $user, SolicitudPermiso $solicitud): array
    {
        $userTypes = $this->getUserApprovalTypes($user);
        $pendingTypes = $this->getPendingApprovalTypes($solicitud);

        return array_filter($userTypes, function ($tipo) use ($pendingTypes) {
            return in_array($tipo->value, $pendingTypes);
        });
    }
}
