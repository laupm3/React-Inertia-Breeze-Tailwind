<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;
use App\Models\Empleado;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    /**
     * Endpoint para el bloque de "Estados de Empleados".
     * Acepta un parámetro opcional 'leave_reason' para filtrar ausencias.
     */
    public function employeeStatuses(Request $request): JsonResponse
    {
        $statuses = $this->dashboardService->getEmployeeStatuses($request->input('leave_reason'));
        return response()->json($statuses);
    }

    /**
     * Obtiene la razón específica por la que un empleado activo no está trabajando.
     */
    public function getNotWorkingReason(Empleado $empleado): JsonResponse
    {
        $reason = $this->dashboardService->getNotWorkingReasonForEmployee($empleado);
        return response()->json($reason);
    }

    /**
     * Endpoint para el bloque de "Usuarios Activos".
     */
    public function activeUsersCount(): JsonResponse
    {
        $stats = $this->dashboardService->getActiveUsersStats();
        return response()->json($stats);
    }

    /**
     * Endpoint para el bloque de estadísticas de "Justificantes".
     */
    public function justificationStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getJustificationStats());
    }

    /**
     * Endpoint para el bloque de estadísticas de "Fichajes".
     */
    public function clockingStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getClockingStats());
    }

    /**
     * Endpoint para el bloque de "Vacaciones pendientes".
     */
    public function pendingVacationStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getPendingVacationStats());
    }

    /**
     * Endpoint para el bloque de "Permisos pendientes (excl. vacaciones)".
     */
    public function pendingPermissionStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getPendingPermissionStats());
    }

    /**
     * Endpoint para el bloque de "Empleados por Departamento".
     */
    public function employeesByDepartmentStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getEmployeesByDepartmentStats());
    }

    /**
     * Endpoint para el bloque de "Finalización de contratos".
     */
    public function expiringContractsStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getExpiringContractsStats());
    }

    /**
     * Endpoint para el bloque de "Caducidad de documentos".
     */
    public function expiringDocumentsStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getExpiringDocumentsStats());
    }

    /**
     * Endpoint para el bloque de "Empleados sin antigüedad".
     */
    public function newEmployeesStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getNewEmployeesStats());
    }

    /**
     * Endpoint para obtener todos los tipos de permisos/ausencias.
     */
    public function absenceTypes(): JsonResponse
    {
        return response()->json($this->dashboardService->getAbsenceTypes());
    }
}
