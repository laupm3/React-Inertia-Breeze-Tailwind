<?php

namespace App\Services\Dashboard;

use App\Models\Contrato;
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\EstadoSolicitudPermiso;
use App\Models\Horario;
use App\Models\Permiso;
use App\Models\SolicitudPermiso;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use App\Services\Dashboard\EmployeeStatusService;
use Detection\MobileDetect;
use App\Models\AbsenceNote;
use App\Enums\AbsenceNoteStatus;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    const STATUS_EMPLOYEE_ACTIVE = 1;
    const STATUS_EMPLOYEE_INACTIVE = 2;
    const STATUS_EMPLOYEE_SICK_LEAVE = 3;

    public function __construct(private EmployeeStatusService $employeeStatusService) {}

    public function getEmployeeStatuses(?string $leaveReasonFilter = null): array
    {
        $result = $this->employeeStatusService->getInitialStatuses($leaveReasonFilter);
        Log::info('DashboardService@getEmployeeStatuses', [
            'result_count' => array_map(fn($g) => count($g['employees']), $result),
        ]);
        return $result;
    }

    /**
     * Obtiene el número de usuarios activos conectados y el total de empleados activos.
     */
    public function getActiveUsersStats(): array
    {
        $totalUsers = User::where('status', UserStatus::ACTIVE->value)->count();

        // Proporcionamos un valor inicial para los usuarios conectados.
        // El frontend lo actualizará en tiempo real vía WebSocket.
        return [
            'total_users_count' => $totalUsers,
            'connected_users_count' => 0, // Valor inicial
        ];
    }

    /**
     * Obtiene las estadísticas de justificantes para el dashboard.
     */
    public function getJustificationStats(): array
    {
        // Define el rango de fechas para el gráfico (últimos 7 días).
        $endDate = now()->endOfDay();
        $startDate = now()->subDays(6)->startOfDay();
        $dateRangeForChart = collect(CarbonPeriod::create($startDate, $endDate)->toArray());

        // Usamos el Enum para el estado pendiente. Es más robusto y legible.
        $pendingStatus = AbsenceNoteStatus::PENDING->value;

        // Obtiene las notas de ausencia pendientes DENTRO del rango para el gráfico.
        // La consulta ahora apunta a la nueva tabla 'absence_notes'.
        $weeklyPendingNotes = AbsenceNote::where('status', $pendingStatus)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        // Formatea los datos para el gráfico (el helper sigue siendo válido).
        $weeklyChartData = $this->formatChartData($dateRangeForChart, $weeklyPendingNotes);

        // Obtiene el CONTEO de notas pendientes ANTERIORES al rango del gráfico.
        $olderPendingCount = AbsenceNote::where('status', $pendingStatus)
            ->where('created_at', '<', $startDate)
            ->count();

        // Devuelve la misma estructura de datos que el frontend ya espera.
        return [
            'weekly_stats' => $weeklyChartData,
            'older_pending_count' => $olderPendingCount,
            'total_pending_count' => $weeklyPendingNotes->sum() + $olderPendingCount
        ];
    }

    /**
     * Obtiene estadísticas sobre los fichajes del día.
     */
    public function getClockingStats()
    {
        $today = now()->startOfDay();

        // 1. Obtener todos los horarios de hoy que han sido fichados
        $clockedInHorarios = Horario::whereDate('horario_inicio', $today)
            ->whereNotNull('fichaje_entrada')
            ->get();

        // 2. Calcular el total de horarios para hoy
        $totalHorariosHoy = Horario::whereDate('horario_inicio', $today)->count();

        // 3. Agrupar fichajes por hora y dispositivo
        $statsByHour = collect(range(0, 23))->mapWithKeys(function ($hour) {
            return [
                str_pad($hour, 2, '0', STR_PAD_LEFT) => [
                    'total' => 0,
                    'devices' => [
                        'Web' => 0,
                        'Móvil' => 0,
                        'Tablet' => 0,
                    ],
                ]
            ];
        });

        foreach ($clockedInHorarios as $horario) {
            $hour = $horario->fichaje_entrada->format('H');
            $device = $this->categorizeUserAgent($horario->user_agent_entrada);

            // Obtenemos la data actual de esa hora
            $currentHourData = $statsByHour->get($hour);

            // Modificamos los contadores
            $currentHourData['total']++;
            if (isset($currentHourData['devices'][$device])) {
                $currentHourData['devices'][$device]++;
            }

            // Guardamos la data modificada en la colección
            $statsByHour->put($hour, $currentHourData);
        }

        return [
            'summary' => [
                'total_today' => $totalHorariosHoy,
                'clocked_in_count' => $clockedInHorarios->count(),
            ],
            'by_hour' => $statsByHour,
        ];
    }

    /**
     * Obtiene estadísticas sobre las solicitudes de vacaciones pendientes.
     * Criterios: Solicitudes de 'Vacaciones' con estado 'Solicitado', 'En revisión' o 'En proceso'.
     * Agrupado por fecha de CREACIÓN de la solicitud para el gráfico de los últimos 7 días.
     */
    public function getPendingVacationStats(): array
    {
        $pendingStatuses = ['Solicitado', 'En revisión', 'En proceso'];
        $endDate = now()->endOfDay();
        $startDate = now()->subDays(6)->startOfDay();
        $dateRangeForChart = collect(CarbonPeriod::create($startDate, $endDate)->toArray());

        // 1. Construir la consulta base para reutilizarla.
        $baseQuery = SolicitudPermiso::query()
            ->vacaciones() // Filtra solo las que son de tipo 'Vacaciones'.
            ->whereHas('estado', function ($query) use ($pendingStatuses) {
                $query->whereIn('nombre', $pendingStatuses);
            });

        // 2. Obtener los datos para el gráfico (solo los del rango de fechas).
        $weeklyPendingVacations = (clone $baseQuery)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        // 3. Obtener el recuento de vacaciones pendientes ANTERIORES al rango del gráfico.
        $olderPendingCount = (clone $baseQuery)
            ->where('created_at', '<', $startDate)
            ->count();

        // 4. Obtener el recuento total de TODAS las vacaciones pendientes.
        $totalPending = (clone $baseQuery)->count();

        // 5. Usar el helper para formatear los datos del gráfico.
        $chartData = $this->formatChartData($dateRangeForChart, $weeklyPendingVacations);

        // 6. Devolver la estructura de datos consistente con otros widgets.
        return [
            'weekly_stats' => $chartData,
            'older_pending_count' => $olderPendingCount,
            'total_pending_count' => $totalPending,
        ];
    }

    /**
     * Obtiene estadísticas sobre las solicitudes de permisos pendientes (excluyendo vacaciones).
     */
    public function getPendingPermissionStats(): array
    {
        // 1. Definir los estados que consideramos "pendientes".
        $pendingStatuses = ['Solicitado', 'En revisión', 'En proceso'];

        // 2. Construir la consulta base para reutilizarla.
        $baseQuery = SolicitudPermiso::query()
            ->exceptVacaciones() // Excluir las vacaciones es correcto para este widget.
            ->whereHas('estado', function ($query) use ($pendingStatuses) {
                $query->whereIn('nombre', $pendingStatuses);
            });

        // 3. Clonar la consulta para no afectar los cálculos posteriores.
        $allPendingPermissions = (clone $baseQuery)
            ->with('permiso:id,nombre')
            ->select('id', 'permiso_id', 'created_at')
            ->get();

        // 4. Calcular el desglose por tipo de permiso.
        $breakdown = $allPendingPermissions
            ->groupBy('permiso.nombre')
            ->map(function ($requests, $permissionName) {
                return [
                    'name' => $permissionName,
                    'count' => $requests->count(),
                ];
            })
            ->sortBy('name')
            ->values();

        // 5. Contar las solicitudes pendientes creadas antes de hoy.
        $olderPendingCount = $allPendingPermissions
            ->where('created_at', '<', today()->startOfDay())
            ->count();

        // 6. Devolver la estructura de datos completa y lista para el frontend.
        return [
            'total_pending' => $allPendingPermissions->count(),
            'older_pending_count' => $olderPendingCount,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Obtiene el número de empleados activos por departamento.
     */
    public function getEmployeesByDepartmentStats()
    {
        // 1. Modificamos la consulta para contar EMPLEADOS ÚNICOS, no contratos.
        $departmentStats = Departamento::query()
            // Nos aseguramos de que solo traemos departamentos que tienen empleados activos con contratos vigentes
            ->whereHas('contratosVigentes.empleado', function ($query) {
                $query->where('estado_id', self::STATUS_EMPLOYEE_ACTIVE);
            })
            // Usamos una subconsulta para contar los IDs de empleado distintos para cada departamento
            ->withCount(['contratosVigentes as employee_count' => function (Builder $query) {
                $query->select(DB::raw('count(distinct empleado_id)'))
                    ->whereHas('empleado', function ($subQuery) {
                        $subQuery->where('estado_id', self::STATUS_EMPLOYEE_ACTIVE);
                    });
            }])
            ->get();

        // 2. Transformamos la colección para que coincida con el formato de la API esperado.
        $formattedStats = $departmentStats->map(function ($department) {
            return [
                'department_name' => $department->nombre,
                'employee_count' => $department->employee_count,
            ];
        });

        // 3. Devolvemos la respuesta en la estructura final.
        return [
            'stats' => $formattedStats->all(), // <-- CAMBIO AQUÍ
        ];
    }

    /**
     * Obtiene estadísticas sobre la finalización de contratos.
     * VERSIÓN FINAL: Calcula los contadores por rangos explícitos y no solapados.
     */
    public function getExpiringContractsStats(): array
    {
        $now = now()->startOfDay();
        // Usamos los IDs de los estados que queremos incluir
        $includedEmployeeStates = [
            self::STATUS_EMPLOYEE_ACTIVE,
            self::STATUS_EMPLOYEE_INACTIVE,
            self::STATUS_EMPLOYEE_SICK_LEAVE
        ];

        // 1. Obtener todos los contratos relevantes de una sola vez.
        $expiringSoonContracts = Contrato::with(['empleado.user', 'departamento', 'centro', 'empresa'])
            ->whereHas('empleado', function ($query) use ($includedEmployeeStates) {
                $query->whereIn('estado_id', $includedEmployeeStates);
            })
            // Buscamos contratos que expiran entre hoy y los próximos 30 días.
            ->whereBetween('fecha_fin', [$now, $now->copy()->addDays(30)])
            ->get();

        // 2. Inicializar los contadores a cero. Esto previene errores si no hay resultados.
        $expiringCounts = ['10' => 0, '15' => 0, '30' => 0];

        // 3. Refactorizo el bucle para que sea más robusto con if-elseif.
        foreach ($expiringSoonContracts as $contrato) {
            $daysRemaining = $now->diffInDays($contrato->fecha_fin, false);
            if ($daysRemaining >= 0 && $daysRemaining <= 10) {
                $expiringCounts['10']++;
            } elseif ($daysRemaining <= 15) {
                $expiringCounts['15']++;
            } elseif ($daysRemaining <= 30) {
                $expiringCounts['30']++;
            }
        }

        // 4. Preparar la lista para el frontend, ordenando por fecha de finalización.
        $expiringSoonList = $expiringSoonContracts
            ->sortBy('fecha_fin')
            ->take(5) // Mostramos solo los 5 más próximos.
            ->map(function ($contrato) use ($now) {
                return [
                    'id' => $contrato->id,
                    'fecha_fin' => $contrato->fecha_fin->format('Y-m-d'),
                    'dias_restantes' => (int) $now->diffInDays($contrato->fecha_fin, false),
                    'empleado' => [
                        'id' => $contrato->empleado->id,
                        'full_name' => $contrato->empleado->fullName,
                        'profile_photo_url' => $contrato->empleado->user?->profile_photo_url,
                    ],
                    'department_name' => $contrato->departamento?->nombre,
                    'center_name' => $contrato->centro?->nombre ?? 'Sin centro',
                    'company_name' => $contrato->empresa?->nombre ?? 'Sin empresa',
                ];
            })->values();

        return [
            'expiring_in_days_counts' => $expiringCounts,
            'expiring_soon_list' => $expiringSoonList->all(),
        ];
    }

    /**
     * Obtiene y formatea los datos de un único contrato para el widget.
     */
    public function getSingleExpiringContractStat(Contrato $contrato): array
    {
        // Corregido: La estructura ahora coincide con la lista inicial
        return [
            'id' => $contrato->id,
            'fecha_fin' => ($contrato->fecha_fin) ? $contrato->fecha_fin->format('Y-m-d') : null,
            'dias_restantes' => (int) now()->diffInDays($contrato->fecha_fin, false),
            'empleado' => [
                'id' => $contrato->empleado->id,
                'full_name' => $contrato->empleado->fullName,
                'profile_photo_url' => $contrato->empleado->user?->profile_photo_url,
            ],
            'department_name' => $contrato->departamento?->nombre,
            'center_name' => $contrato->centro?->nombre ?? 'Sin centro',
            'company_name' => $contrato->empresa?->nombre ?? 'Sin empresa',
        ];
    }

    /**
     * Obtiene estadísticas sobre la caducidad de documentos de empleados.
     */
    public function getExpiringDocumentsStats(): array
    {
        $now = now()->startOfDay();
        $includedEmployeeStates = [
            self::STATUS_EMPLOYEE_ACTIVE,
            self::STATUS_EMPLOYEE_INACTIVE,
            self::STATUS_EMPLOYEE_SICK_LEAVE
        ];

        // 1. Obtener todos los empleados relevantes de una sola vez, sin un límite grande.
        $expiringSoonEmployees = Empleado::with([
            'user:id,name,profile_photo_path,empleado_id',
            'tipoDocumento:id,nombre',
            'contratosVigentes' => fn($q) => $q->with(['departamento:id,nombre', 'centro:id,nombre', 'empresa:id,nombre'])->limit(1)
        ])
            ->whereIn('estado_id', $includedEmployeeStates)
            ->whereNotNull('caducidad_nif')
            ->whereBetween('caducidad_nif', [$now, $now->copy()->addDays(30)])
            ->select(['id', 'user_id', 'tipo_documento_id', 'caducidad_nif', 'nombre', 'primer_apellido', 'segundo_apellido'])
            ->get();

        // 2. Inicializar contadores a cero.
        $expiringCounts = ['10' => 0, '15' => 0, '30' => 0];

        // 3. Lógica de if-elseif
        foreach ($expiringSoonEmployees as $empleado) {
            $daysRemaining = $now->diffInDays($empleado->caducidad_nif, false);
            if ($daysRemaining >= 0 && $daysRemaining <= 10) {
                $expiringCounts['10']++;
            } elseif ($daysRemaining <= 15) {
                $expiringCounts['15']++;
            } elseif ($daysRemaining <= 30) {
                $expiringCounts['30']++;
            }
        }

        // 4. Preparar la lista para el frontend.
        $expiringSoonList = $expiringSoonEmployees
            ->sortBy('caducidad_nif')
            ->take(5)
            ->map(function ($empleado) use ($now) {
                $contratoVigente = $empleado->contratosVigentes->first();
                return [
                    'id' => $empleado->id,
                    'fecha_caducidad' => $empleado->caducidad_nif->format('Y-m-d'),
                    'dias_restantes' => (int) $now->diffInDays($empleado->caducidad_nif, false),
                    'document_type' => $empleado->tipoDocumento?->nombre ?? 'Documento',
                    'empleado' => [
                        'id' => $empleado->id,
                        'full_name' => $empleado->fullName,
                        'profile_photo_url' => $empleado->user?->profile_photo_url,
                        'department_name' => $contratoVigente?->departamento?->nombre ?? 'Sin departamento',
                        'center_name' => $contratoVigente?->centro?->nombre ?? 'Sin centro',
                        'company_name' => $contratoVigente?->empresa?->nombre ?? 'Sin empresa',
                    ],
                ];
            })->values();

        return [
            'expiring_in_days_counts' => $expiringCounts,
            'expiring_soon_list' => $expiringSoonList->all(),
        ];
    }

    /**
     * Obtiene y formatea los datos de un único documento de empleado para el widget.
     */
    public function getSingleExpiringDocumentStat(Empleado $empleado): array
    {
        $contratoVigente = $empleado->contratosVigentes->first();
        // Nuevo: Lógica para enviar la actualización de un solo documento.
        return [
            'id' => $empleado->id,
            'fecha_caducidad' => $empleado->caducidad_nif?->format('Y-m-d'),
            'dias_restantes' => $empleado->caducidad_nif ? (int) now()->diffInDays($empleado->caducidad_nif, false) : null,
            'document_type' => $empleado->tipoDocumento?->nombre ?? 'Documento',
            'empleado' => [
                'id' => $empleado->id,
                'full_name' => $empleado->fullName,
                'profile_photo_url' => $empleado->user?->profile_photo_url,
                'department_name' => $contratoVigente?->departamento?->nombre ?? 'Sin departamento',
                'center_name' => $contratoVigente?->centro?->nombre ?? 'Sin centro',
                'company_name' => $contratoVigente?->empresa?->nombre ?? 'Sin empresa',
            ],
        ];
    }

    /**
     * Obtiene estadísticas sobre empleados sin antigüedad (nuevas incorporaciones).
     * Un empleado es considerado "nuevo" si su fecha de antigüedad aún no ha sido establecida.
     */
    public function getNewEmployeesStats(): array
    {
        $includedEmployeeStates = [
            self::STATUS_EMPLOYEE_ACTIVE,
            self::STATUS_EMPLOYEE_INACTIVE,
            self::STATUS_EMPLOYEE_SICK_LEAVE
        ];

        // 1. OBTENEMOS EL CONTEO TOTAL PRIMERO
        $newEmployeeCount = Empleado::whereIn('estado_id', $includedEmployeeStates)
            ->whereNull('seniority_date')
            ->count();

        // 2. OBTENEMOS SOLO UNA LISTA PEQUEÑA PARA LA VISTA
        $newEmployees = Empleado::with([
            'user',
            'contratosVigentes' => fn($q) => $q->with(['departamento:id,nombre', 'centro:id,nombre', 'empresa:id,nombre'])->limit(1)
        ])
            ->whereIn('estado_id', $includedEmployeeStates)
            ->whereNull('seniority_date')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $newEmployeesList = $newEmployees->map(function ($empleado) {
            $latestContract = $empleado->contratosVigentes->first();
            return [
                'id' => $empleado->id,
                'full_name' => $empleado->fullName,
                'department_name' => $latestContract?->departamento?->nombre ?? 'Sin departamento',
                'center_name' => $latestContract?->centro?->nombre ?? 'Sin centro',
                'company_name' => $latestContract?->empresa?->nombre ?? 'Sin empresa',
                'profile_photo_url' => $empleado->user?->profile_photo_url,
            ];
        });

        return [
            'new_employee_count' => $newEmployeeCount,
            'new_employees_list' => $newEmployeesList->all(),
        ];
    }

    /**
     * Obtiene y formatea los datos de un único empleado nuevo para el widget.
     */
    public function getSingleNewEmployeeStat(Empleado $empleado): array
    {
        $latestContract = $empleado->contratosVigentes->first();
        // Nuevo: Lógica para enviar la actualización de un solo empleado nuevo.
        return [
            'id' => $empleado->id,
            'full_name' => $empleado->fullName,
            'department_name' => $latestContract?->departamento?->nombre ?? 'Sin departamento',
            'center_name' => $latestContract?->centro?->nombre ?? 'Sin centro',
            'company_name' => $latestContract?->empresa?->nombre ?? 'Sin empresa',
            'profile_photo_url' => $empleado->user?->profile_photo_url,
        ];
    }

    /**
     * Obtiene una lista de todos los nombres de permisos para usar en filtros.
     */
    public function getAbsenceTypes(): array
    {
        // Añadimos valores fijos para otros tipos de ausencia que no son 'Permiso'.
        $hardcodedTypes = ['Justificado', 'Suspensión'];

        $permissionNames = \App\Models\Permiso::orderBy('nombre')->pluck('nombre');

        return collect($hardcodedTypes)->merge($permissionNames)->unique()->sort()->values()->all();
    }

    public function getNotWorkingReasonForEmployee(Empleado $empleado): array
    {
        return $this->employeeStatusService->getNotWorkingReason($empleado);
    }

    // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---

    /**
     * Formatea los datos para los gráficos de líneas del dashboard.
     *
     * @param Collection $dateRange Colección de fechas (Carbon u objetos string) que definen el eje X.
     * @param Collection $dataPoints Colección asociativa ['fecha' => valor] con los puntos de datos.
     * @return array Un array de objetos listos para ser consumidos por Recharts.
     */
    private function formatChartData(Collection $dateRange, Collection $dataPoints): array
    {
        // 1. Inicializa un mapa con todas las fechas del rango y un contador a 0.
        $results = $dateRange->mapWithKeys(function ($date) {
            $carbonDate = $date instanceof \Carbon\Carbon ? $date : \Carbon\Carbon::parse($date);
            return [$carbonDate->toDateString() => 0];
        });

        // 2. Itera sobre los datos reales y actualiza el mapa.
        //    Esto llena los días que sí tienen datos.
        foreach ($dataPoints as $date => $count) {
            if ($results->has($date)) {
                $results[$date] = $count;
            }
        }

        // 3. Convierte el mapa al formato final que espera el frontend.
        return $results->map(function ($count, $date) {
            return ['date' => $date, 'count' => $count];
        })->values()->all();
    }

    /**
     * Categoriza un string de User Agent usando la biblioteca MobileDetect.
     * Es mucho más preciso y robusto que el análisis manual de strings.
     */
    private function categorizeUserAgent(?string $userAgent): string
    {
        if (!$userAgent) {
            return 'Desconocido';
        }

        $detect = new MobileDetect;
        $detect->setUserAgent($userAgent);

        if ($detect->isTablet()) {
            return 'Tablet';
        }

        if ($detect->isMobile()) {
            return 'Móvil';
        }

        // Si no es ni móvil ni tablet, asumimos que es un navegador de escritorio.
        return 'Web';
    }
}
