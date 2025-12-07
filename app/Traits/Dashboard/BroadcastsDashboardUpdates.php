<?php

namespace App\Traits\Dashboard;

use App\Events\Dashboard\DashboardWidgetUpdated;
use App\Models\AbsenceNote;
use App\Models\Contrato;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Horario;
use App\Models\SolicitudPermiso;
use App\Services\Dashboard\DashboardService;
use App\Services\Dashboard\EmployeeStatusService;
use App\Enums\AbsenceNoteStatus;
use App\Models\EstadoSolicitudPermiso;
use Detection\MobileDetect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait BroadcastsDashboardUpdates
{
    protected static function bootBroadcastsDashboardUpdates()
    {
        static::saved(function ($model) {
            $model->broadcastDashboardUpdate(false);
        });

        static::deleted(function ($model) {
            $model->broadcastDashboardUpdate(true);
        });
    }

    public function broadcastDashboardUpdate(bool $isDeleted = false)
    {
        $widgetNames = $this->getWidgetNames();
        if (empty($widgetNames)) return;

        $dashboardService = app(DashboardService::class);
        $payload = null;

        foreach ($widgetNames as $widgetName) {
            switch ($widgetName) {
                case 'employee-statuses':
                    $payload = $this->getEmployeeStatusDeltaPayload();
                    break;

                case 'expiring-contracts-stats':
                    $payload = $this->getExpiringItemDeltaPayload($isDeleted, $this, 'fecha_fin');
                    break;

                case 'expiring-documents-stats':
                    $payload = $this->getExpiringItemDeltaPayload($isDeleted, $this, 'caducidad_nif');
                    break;

                case 'new-employees-stats':
                    $payload = $this->getNewEmployeeDeltaPayload($isDeleted, $dashboardService);
                    break;

                case 'active-users-count':
                    $payload = $this->getActiveUsersDeltaPayload();
                    break;

                case 'justification-stats':
                    $payload = $this->getJustificationStatsDeltaPayload($isDeleted);
                    break;

                case 'clocking-stats':
                    $payload = $this->getClockingStatsDeltaPayload();
                    break;

                case 'pending-vacation-stats':
                case 'pending-permission-stats':
                    $payload = $this->getSolicitudPermisoDeltaPayload($isDeleted, $widgetName);
                    break;

                case 'employees-by-department-stats':
                    $payload = $this->getDepartmentStatsDeltaPayload($isDeleted);
                    break;

                default:
                    Log::warning('Unhandled widget in BroadcastsDashboardUpdates sync logic.', ['widget' => $widgetName]);
                    continue 2; // Salta a la siguiente iteración del foreach
            }

            if ($payload) {
                // Añadimos el widgetName al payload para que el frontend no tenga que adivinarlo
                $payload['widget_name'] = $widgetName;
                Log::info('Broadcasting widget update (DELTA)', [
                        'widget' => $widgetName,
                        'model' => get_class($this),
                        'model_id' => $this->id ?? null,
                    'payload_type' => $payload['type'] ?? 'unknown_delta'
                ]);
                DashboardWidgetUpdated::dispatch($widgetName, $payload);
            }
        }
    }

    // --- MÉTODOS GENERADORES DE PAYLOADS DELTA ---

    private function getExpiringItemDeltaPayload(bool $isDeleted, $model, string $dateField): ?array
    {
        $payload = ['type' => 'expiring_item_delta'];
        $now = now()->startOfDay();

        $getCategory = function ($date) use ($now) {
            if (!$date) return null;
            $days = $now->diffInDays($date, false);
            if ($days >= 0 && $days <= 10) return '10';
            if ($days > 10 && $days <= 15) return '15';
            if ($days > 15 && $days <= 30) return '30';
            return null;
        };

        $oldDate = $this->getOriginal($dateField) ? \Carbon\Carbon::parse($this->getOriginal($dateField)) : null;
        $newDate = $this->{$dateField};

        $oldCategory = $getCategory($oldDate);
        $newCategory = $getCategory($newDate);

        // Obtenemos los detalles del item para la lista
        $service = app(DashboardService::class);
        $widgetName = $dateField === 'fecha_fin' ? 'expiring-contracts-stats' : 'expiring-documents-stats';

        $methodMap = [
            'expiring-contracts-stats' => 'getSingleExpiringContractStat',
            'expiring-documents-stats' => 'getSingleExpiringDocumentStat',
        ];
        $singleItemMethod = $methodMap[$widgetName];
        
        $details = $service->{$singleItemMethod}($model);

        if ($isDeleted) {
            if ($oldCategory) $payload['decrement'] = $oldCategory;
            $payload['item_id_to_remove'] = $model->id;
        } elseif ($this->wasRecentlyCreated) {
            if ($newCategory) $payload['increment'] = $newCategory;
            $payload['item_to_add'] = $details;
        } elseif ($this->wasChanged($dateField)) {
            if ($oldCategory !== $newCategory) {
                if ($oldCategory) $payload['decrement'] = $oldCategory;
                if ($newCategory) $payload['increment'] = $newCategory;
            }
            $payload['item_to_update'] = $details;
        } else {
            return null;
        }
        
        return (count($payload) > 1) ? $payload : null;
    }

    private function getNewEmployeeDeltaPayload(bool $isDeleted, DashboardService $service): ?array
    {
        if ($isDeleted) {
            return ['type' => 'new_employee_remove', 'id' => $this->id];
        }
        // Solo nos importa si el estado cambia A "sin antigüedad" (null) o si se crea así.
        $isNew = is_null($this->seniority_date);
        $wasNew = is_null($this->getOriginal('seniority_date'));

        if ($this->wasRecentlyCreated && $isNew) {
             return ['type' => 'new_employee_add', 'details' => $service->getSingleNewEmployeeStat($this)];
        }

        if ($this->wasChanged('seniority_date')) {
            // Pasó de tener fecha a NO tenerla (raro, pero posible)
            if (!$wasNew && $isNew) {
                return ['type' => 'new_employee_add', 'details' => $service->getSingleNewEmployeeStat($this)];
            }
            // Pasó de NO tener fecha a SÍ tenerla (lo más común)
            if ($wasNew && !$isNew) {
                return ['type' => 'new_employee_remove', 'id' => $this->id];
            }
        }
        
        return null;
    }

    private function getSolicitudPermisoDeltaPayload(bool $isDeleted, string $widgetName): ?array
    {
        $solicitud = $this;
        if (!($solicitud instanceof SolicitudPermiso)) {
            return null;
        }

        $isVacationWidget = $widgetName === 'pending-vacation-stats';
        $solicitudIsVacation = $solicitud->permiso->nombre === 'Vacaciones';

        if ($isVacationWidget !== $solicitudIsVacation) {
            return null;
        }

        $unresolvedStatuses = ['Solicitado', 'En revisión', 'En proceso'];
        $oldStatusName = optional(EstadoSolicitudPermiso::find($solicitud->getOriginal('estado_id')))->nombre;
        $newStatusName = optional($solicitud->estado)->nombre;

        $wasUnresolved = in_array($oldStatusName, $unresolvedStatuses);
        $isUnresolved = in_array($newStatusName, $unresolvedStatuses);
        $change = 0;

        if ($isDeleted) {
            if ($wasUnresolved) $change = -1;
        } elseif ($solicitud->wasRecentlyCreated) {
            if ($isUnresolved) $change = 1;
        } elseif ($solicitud->wasChanged('estado_id')) {
            if ($wasUnresolved && !$isUnresolved) $change = -1;
            elseif (!$wasUnresolved && $isUnresolved) $change = 1;
        }

        if ($change === 0) return null;

        $payload = ['change' => $change];

        if ($isVacationWidget) {
            $service = app(DashboardService::class);
            // Esto obtiene el recuento de la DB ANTES de que la transacción actual se confirme.
            $currentTotal = $service->getPendingVacationStats()['total_pending_count'];

            $payload['type'] = 'vacation_delta';
            $payload['date'] = $solicitud->created_at->toDateString();
            // Calculamos el nuevo total y lo enviamos para que el frontend no tenga que hacerlo.
            $payload['total_pending_count'] = $currentTotal + $change;
        } else {
            $service = app(DashboardService::class);
            $currentTotal = $service->getPendingPermissionStats()['total_pending'];

            $payload['type'] = 'permission_delta';
            $payload['permission_name'] = $solicitud->permiso->nombre;
            // CORRECCIÓN: Usar 'total_pending' para ser consistente con los datos iniciales.
            $payload['total_pending'] = $currentTotal + $change;
        }

        return $payload;
    }

    private function getListWidgetDeltaPayload(bool $isDeleted, string $widgetName, DashboardService $service): ?array
    {
        if ($isDeleted) {
            return ['type' => 'delete', 'id' => $this->id];
        }

        $singleItemMethod = 'getSingle' . ucfirst(Str::camel(str_replace('-stats', '', $widgetName))) . 'Stat';
        if (method_exists($service, $singleItemMethod)) {
            return ['type' => 'update', 'details' => $service->{$singleItemMethod}($this)];
        }
        return null;
    }

    private function getEmployeeStatusDeltaPayload(): ?array
    {
        $empleado = null;
        if ($this instanceof Empleado) $empleado = $this;
        elseif ($this instanceof Contrato) $empleado = $this->empleado;
        elseif ($this instanceof Horario) $empleado = $this->contrato?->empleado;
        elseif ($this instanceof AbsenceNote) $empleado = $this->horario?->contrato?->empleado;

        if ($empleado) {
            $status = app(EmployeeStatusService::class)->getSingleEmployeeStatus($empleado);
            return ['type' => 'update', 'employee_id' => $empleado->id, 'status' => $status, 'group' => $status['status']];
        }
        return null;
    }

    private function getActiveUsersDeltaPayload(): ?array
    {
        if (!$this instanceof Empleado || !$this->wasChanged('estado_id')) return null;

        $oldStatus = $this->getOriginal('estado_id');
        $newStatus = $this->estado_id;

        if ($oldStatus != 1 && $newStatus == 1) return ['type' => 'active_users_increment'];
        if ($oldStatus == 1 && $newStatus != 1) return ['type' => 'active_users_decrement'];

        return null;
    }

    private function getJustificationStatsDeltaPayload(bool $isDeleted): ?array
    {
        if (!$this instanceof AbsenceNote) return null;

        $wasPending = $this->getOriginal('status') === AbsenceNoteStatus::PENDING->value;
        $isPending = $this->status === AbsenceNoteStatus::PENDING->value;
        $date = $this->created_at->toDateString();

        if ($isDeleted && $wasPending) return ['type' => 'justification_resolve', 'date' => $date];
        if ($this->wasRecentlyCreated && $isPending) return ['type' => 'justification_add', 'date' => $date];
        if ($this->wasChanged('status') && $wasPending && !$isPending) return ['type' => 'justification_resolve', 'date' => $date];
        if ($this->wasChanged('status') && !$wasPending && $isPending) return ['type' => 'justification_add', 'date' => $date];

        return null;
    }

    private function getClockingStatsDeltaPayload(): ?array
    {
        if (!$this instanceof Horario || !$this->wasChanged('fichaje_entrada') || $this->getOriginal('fichaje_entrada') !== null) return null;

        $detect = new MobileDetect;
        $detect->setUserAgent($this->user_agent_entrada);

        if ($detect->isTablet()) $device = 'Tablet';
        elseif ($detect->isMobile()) $device = 'Móvil';
        else $device = 'Web';

        return [
            'type' => 'clocking_add',
            'hour' => $this->fichaje_entrada->format('H'),
            'device' => $device,
        ];
    }

    private function getPermissionStatsDeltaPayload(bool $isDeleted, string $widgetName): ?array
    {
        if (!$this instanceof SolicitudPermiso) return null;

        $this->loadMissing('permiso');
        $isVacation = $this->permiso?->nombre === 'Vacaciones';

        // El payload solo se genera para el widget correspondiente
        if (($isVacation && $widgetName !== 'pending-vacation-stats') || (!$isVacation && $widgetName !== 'pending-permission-stats')) {
            return null;
        }

        $pendingStateIds = EstadoSolicitudPermiso::whereIn('nombre', ['Solicitado', 'En revisión', 'En proceso'])->pluck('id')->all();
        $wasPending = in_array($this->getOriginal('estado_solicitud_id'), $pendingStateIds);
        $isPending = in_array($this->estado_solicitud_id, $pendingStateIds);
        $date = $this->created_at->toDateString();

        $payloadBase = ['date' => $date, 'permission_name' => $this->permiso->nombre];

        if ($isDeleted && $wasPending) return array_merge(['type' => 'permission_resolve'], $payloadBase);
        if ($this->wasRecentlyCreated && $isPending) return array_merge(['type' => 'permission_add'], $payloadBase);
        if ($this->wasChanged('estado_solicitud_id')) {
            if ($wasPending && !$isPending) return array_merge(['type' => 'permission_resolve'], $payloadBase);
            if (!$wasPending && $isPending) return array_merge(['type' => 'permission_add'], $payloadBase);
        }

        return null;
    }

    private function getDepartmentStatsDeltaPayload(bool $isDeleted): ?array
    {
        if (!$this instanceof Contrato) return null;

        $payload = ['type' => 'department_delta'];
        $this->loadMissing('departamento');

        if ($isDeleted) {
            if ($this->departamento) $payload['decrement'] = $this->departamento->nombre;
        } elseif ($this->wasRecentlyCreated) {
            if ($this->departamento) $payload['increment'] = $this->departamento->nombre;
        } elseif ($this->wasChanged('departamento_id')) {
            if ($this->departamento) $payload['increment'] = $this->departamento->nombre;
            $oldDepartment = Departamento::find($this->getOriginal('departamento_id'));
            if ($oldDepartment) $payload['decrement'] = $oldDepartment->nombre;
        } else {
            return null;
        }

        return (isset($payload['increment']) || isset($payload['decrement'])) ? $payload : null;
    }

    // --- MÉTODOS DE SOPORTE ---

    private function getWidgetNames(): array
    {
        return $this->dashboardWidgetNames ?? (isset($this->dashboardWidgetName) ? [$this->dashboardWidgetName] : []);
    }
}
