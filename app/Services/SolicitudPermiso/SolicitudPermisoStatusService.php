<?php

namespace App\Services\SolicitudPermiso;

use App\Models\EstadoSolicitudPermiso;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\Log;

class SolicitudPermisoStatusService
{
    public function __construct(
        private ApprovalService $approvalService
    ) {}

    /**
     * Actualiza el estado de la solicitud basado en las aprobaciones
     * 
     * @param SolicitudPermiso $solicitud
     * @return bool
     */
    public function updateStatus(SolicitudPermiso &$solicitud): bool
    {
        $newStatus = $this->determineStatusFromApprovals($solicitud);

        if ($solicitud->estado_id === $newStatus) {
            return false;
        }

        $result = $solicitud->update(['estado_id' => $newStatus]);

        $solicitud->load('estado');

        return $result;
    }

    /**
     * Determina el estado basado en las aprobaciones existentes
     * 
     * @param SolicitudPermiso $solicitud
     * @return int - ID del nuevo estado
     */
    private function determineStatusFromApprovals(SolicitudPermiso &$solicitud): int
    {
        $approvalSummary = $this->approvalService->getApprovalSummary($solicitud);

        $estados = EstadoSolicitudPermiso::all(['id', 'nombre'])
            ->keyBy('nombre');

        // Si hay rechazos, estado = RECHAZADO (5)
        if ($approvalSummary['rejected']) {
            return $estados->get('Denegado')->id;
        }

        // Si está completamente aprobado, estado = APROBADO (4)
        if ($approvalSummary['fully_approved']) {
            return $estados->get('Aprobado')->id;
        }

        // Si la solicitud tiene una solicitud de cancelación, estado = CANCELADO (6)
        if ($approvalSummary['is_cancelled']) {
            return $estados->get('Cancelación')->id;
        }

        // Si tiene aprobaciones parciales, estado = EN_REVISION
        if ($approvalSummary['completed_approvals'] > 0) {
            return $estados->get('En proceso')->id;
        }

        // Si ha sido visto pero no aprobado, estado = EN_PROCESO
        if ($solicitud->hasBeenSeen()) {
            return $estados->get('En revisión')->id;
        }

        // Estado inicial = SOLICITADO (1)
        return $estados->get('Solicitado')->id;
    }

    /**
     * Verifica si una solicitud puede ser editada
     */
    public function canBeEdited(SolicitudPermiso $solicitud): bool
    {
        // Solo se puede editar si está en estado PENDIENTE y no tiene aprobaciones
        return $solicitud->estado_id === 1 && // PENDIENTE
            !$solicitud->aprobaciones()->exists();
    }

    /**
     * Verifica si una solicitud puede ser cancelada
     * 
     * @param SolicitudPermiso $solicitud
     * @return bool
     */
    public function canBeCancelled(SolicitudPermiso $solicitud): bool
    {
        // Solo se puede editar si está en estado PENDIENTE y no tiene aprobaciones
        return ($solicitud->estado_id === 1 || $solicitud->estado_id === 2) && // PENDIENTE o EN REVISIÓN
            !$solicitud->aprobaciones()->exists();
    }

    /**
     * Verifica si una solicitud puede ser eliminada
     */
    public function canBeDeleted(SolicitudPermiso $solicitud): bool
    {
        // Solo se puede eliminar en estado PENDIENTE y sin aprobaciones
        return $solicitud->estado_id === 1 && // PENDIENTE
            !$solicitud->aprobaciones()->exists();
    }

    /**
     * Verifica si se pueden agregar más aprobaciones
     */
    public function canReceiveApprovals(SolicitudPermiso $solicitud): bool
    {
        // No se pueden agregar aprobaciones si está RECHAZADO o APROBADO
        return !in_array($solicitud->estado_id, [3, 4]); // 3=APROBADO, 4=RECHAZADO
    }

    /**
     * Obtiene el historial de estados
     */
    public function getStatusHistory(SolicitudPermiso $solicitud): array
    {
        // Aquí podrías implementar la lógica para obtener el historial
        // de cambios de estado si tienes una tabla de auditoría
        return [];
    }
}
