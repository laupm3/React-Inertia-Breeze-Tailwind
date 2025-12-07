<?php

namespace App\Services\Dashboard;

use App\Models\Empleado;
use App\Models\Horario;
use Illuminate\Support\Facades\Log;

class EmployeeStatusService
{
    const STATUS_EMPLOYEE_ACTIVE = 1;
    const STATUS_EMPLOYEE_SICK_LEAVE = 3; 
    const MODALITY_PRESENTIAL = 1;
    const MODALITY_REMOTE = 2;
    const STATUS_SCHEDULE_LEAVE = [7, 6, 9]; // Permiso, Justificado, Suspensión

    public function getInitialStatuses(?string $leaveReasonFilter = null): array
    {
        Log::info('--- getInitialStatuses: START (v7 Logic - Long Term Leave) ---');

        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $excludeIds = [];
        $statuses = [
            'working' => [], 'remote' => [], 'on_break' => [],
            'on_leave' => [], 'late' => [], 'not_working' => []
        ];

        // 1. PRIMERO: Buscar empleados en estados de ausencia de larga duración (ej. Enfermedad)
        $longTermLeaveEmployees = Empleado::with([
            'user:id,name,email,empleado_id,profile_photo_path',
            'estadoEmpleado:id,name',
            'contratosVigentes' => fn ($q) => $q->with(['asignacion:id,nombre', 'departamento:id,nombre', 'centro:id,nombre', 'empresa:id,nombre'])->limit(1)
        ])
        ->where('estado_id', self::STATUS_EMPLOYEE_SICK_LEAVE)
        ->get();
        
        foreach ($longTermLeaveEmployees as $employee) {
            $contrato = $employee->contratosVigentes->first();
            $leaveReason = $employee->estadoEmpleado->name; // El motivo es el propio estado del empleado
            $formattedEmployee = $this->formatEmployee($employee, $contrato, $leaveReason, 'on_leave');
            $statuses['on_leave'][] = $formattedEmployee;
            $excludeIds[] = $employee->id; // Añadir a la lista de exclusión
        }

        // 2. SEGUNDO: Procesar el resto de empleados ACTIVOS
        $activeEmployees = Empleado::with([
            'user:id,name,email,empleado_id,profile_photo_path',
            'contratosVigentes' => fn ($q) => $q->with(['asignacion:id,nombre', 'departamento:id,nombre', 'centro:id,nombre', 'empresa:id,nombre'])
        ])
        ->where('estado_id', self::STATUS_EMPLOYEE_ACTIVE)
        ->whereNotIn('id', $excludeIds) // Excluir a los que ya están de baja
        ->get();

        foreach ($activeEmployees as $employee) {
            // ... (el resto de la lógica para empleados activos es la misma que la anterior)
            $contratos = $employee->contratosVigentes;
            $horario = null;
            $contratoParaFormatear = $contratos->first();

            if ($contratos->isNotEmpty()) {
                $contratoIds = $contratos->pluck('id');
                $horario = Horario::where(function ($query) use ($contratoIds) {
                        $query->whereIn('contrato_id', $contratoIds)
                              ->orWhereHas('anexo', fn($q) => $q->whereIn('contrato_id', $contratoIds));
                    })
                    ->whereBetween('horario_inicio', [$todayStart, $todayEnd])
                    ->first();

                if ($horario?->anexo_id && $horario->anexo) {
                    $contratoParaFormatear = $contratos->firstWhere('id', $horario->anexo->contrato_id) ?? $contratos->first();
                } elseif ($horario?->contrato_id) {
                    $contratoParaFormatear = $contratos->firstWhere('id', $horario->contrato_id) ?? $contratos->first();
                }
            }

            $statusData = $this->determineStatusFromHorario($horario);
            
            $formattedEmployee = $this->formatEmployee($employee, $contratoParaFormatear, $statusData['leave_reason'], $statusData['status']);
            $statuses[$statusData['status']][] = $formattedEmployee;
        }

        Log::info('--- getInitialStatuses: END ---', [
            'working' => count($statuses['working']), 'remote' => count($statuses['remote']),
            'on_break' => count($statuses['on_break']), 'on_leave' => count($statuses['on_leave']),
            'late' => count($statuses['late']), 'not_working' => count($statuses['not_working']),
        ]);

        return [
            'working' => ['count' => count($statuses['working']), 'employees' => $statuses['working']],
            'remote' => ['count' => count($statuses['remote']), 'employees' => $statuses['remote']],
            'on_break' => ['count' => count($statuses['on_break']), 'employees' => $statuses['on_break']],
            'on_leave' => ['count' => count($statuses['on_leave']), 'employees' => $statuses['on_leave']],
            'late' => ['count' => count($statuses['late']), 'employees' => $statuses['late']],
            'not_working' => ['count' => count($statuses['not_working']), 'employees' => $statuses['not_working']],
        ];
    }
    
    // El resto del archivo (getSingleEmployeeStatus, determineStatusFromHorario, formatEmployee, etc.)
    // puede permanecer exactamente igual, ya que la lógica centralizada ya es correcta.
    // ... (resto de métodos sin cambios) ...
    public function getSingleEmployeeStatus(Empleado $empleado, $horarioModel = null): array
    {
        $horario = $horarioModel;
        if (!$horario) {
            // Primero, verificar si el empleado está en un estado de ausencia de larga duración
            if($empleado->estado_id === self::STATUS_EMPLOYEE_SICK_LEAVE) {
                 $statusData = ['status' => 'on_leave', 'leave_reason' => $empleado->estadoEmpleado->name];
                 $contratoVigente = $empleado->contratosVigentes->first();
                 return $this->formatEmployee($empleado, $contratoVigente, $statusData['leave_reason'], $statusData['status']);
            }

            $contratos = $empleado->contratosVigentes()->get();
            if ($contratos->isNotEmpty()) {
                $contratoIds = $contratos->pluck('id');
                $horario = Horario::where(function ($query) use ($contratoIds) {
                        $query->whereIn('contrato_id', $contratoIds)
                              ->orWhereHas('anexo', fn ($q) => $q->whereIn('contrato_id', $contratoIds));
                    })
                    ->whereBetween('horario_inicio', [now()->startOfDay(), now()->endOfDay()])
                    ->first();
            }
        }
        
        $statusData = $this->determineStatusFromHorario($horario);
        $contratoVigente = $empleado->contratosVigentes->first();
        
        $result = $this->formatEmployee($empleado, $contratoVigente, $statusData['leave_reason'], $statusData['status']);

        Log::info('Single employee status (formatted)', ['empleado_id' => $empleado->id, 'payload' => $result]);
        return $result;
    }

    private function determineStatusFromHorario(?Horario $horario): array
    {
        if (!$horario) {
            return ['status' => 'not_working', 'leave_reason' => null];
        }

        $status = 'not_working';
        $leaveReason = null;

        if (in_array($horario->estado_horario_id, self::STATUS_SCHEDULE_LEAVE)) {
            $status = 'on_leave';
            $leaveReason = $horario->solicitudPermiso?->permiso?->nombre ?? $horario->estadoHorario?->name ?? 'Ausente';
        } elseif ($horario->estado_fichaje === 'en_pausa') {
            $status = 'on_break';
        } elseif ($horario->estado_fichaje === 'en_curso') {
            $enDescansoProgramado = false;
            if ($horario->descanso_inicio && $horario->descanso_fin) {
                $enDescansoProgramado = now()->between($horario->descanso_inicio, $horario->descanso_fin);
            }

            if ($enDescansoProgramado) {
                $status = 'on_break';
            } else {
                $status = $horario->modalidad_id === self::MODALITY_REMOTE ? 'remote' : 'working';
            }
        } elseif ($horario->estado_fichaje === 'sin_iniciar' && $horario->horario_inicio->isPast()) {
            $status = 'late';
        }

        return ['status' => $status, 'leave_reason' => $leaveReason];
    }
    
    private function formatEmployee($employee, $contrato, $leaveReason = null, string $status = 'not_working'): array
    {
            $data = [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'email' => $employee->user?->email,
                'profile_photo_url' => $employee->user?->profile_photo_url,
            'job_position' => $contrato?->asignacion?->nombre ?? 'Sin puesto',
            'department_name' => $contrato?->departamento?->nombre ?? 'Sin departamento',
            'center_name' => $contrato?->centro?->nombre ?? 'Sin centro',
            'company_name' => $contrato?->empresa?->nombre ?? 'Sin empresa',
            'status' => $status,
        ];
        
        if ($leaveReason) {
            $data['leave_reason'] = $leaveReason;
        }
        
        return $data;
    }

    public function getNotWorkingReason(Empleado $empleado): array
    {
        if($empleado->estado_id === self::STATUS_EMPLOYEE_SICK_LEAVE) {
            return ['status' => 'SICK_LEAVE', 'message' => 'El empleado se encuentra de baja por enfermedad.'];
        }

        $horarioHoy = null;
        $contratos = $empleado->contratosVigentes()->get();
        if ($contratos->isNotEmpty()) {
            $contratoIds = $contratos->pluck('id');
            $horarioHoy = Horario::where(function ($query) use ($contratoIds) {
                    $query->whereIn('contrato_id', $contratoIds)
                          ->orWhereHas('anexo', fn($q) => $q->whereIn('contrato_id', $contratoIds));
                })
                ->whereBetween('horario_inicio', [now()->startOfDay(), now()->endOfDay()])
                ->orderBy('horario_inicio', 'asc')->first();
        }

        if (!$horarioHoy) {
            return ['status' => 'NO_SCHEDULE', 'message' => 'No tiene un horario asignado para hoy.'];
        }
        if ($horarioHoy->estado_fichaje === 'finalizado') {
            return ['status' => 'SHIFT_FINISHED', 'message' => 'Su turno de hoy ya ha finalizado.', 'details' => new \App\Http\Resources\HorarioResource($horarioHoy)];
        }
        if ($horarioHoy->horario_inicio->isFuture()) {
            return ['status' => 'SHIFT_PENDING', 'message' => 'Su turno aún no ha comenzado.', 'details' => new \App\Http\Resources\HorarioResource($horarioHoy)];
        }
        return ['status' => 'UNKNOWN', 'message' => 'El empleado no está trabajando por un motivo no determinado.'];
    }
}
