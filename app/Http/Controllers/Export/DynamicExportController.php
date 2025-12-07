<?php

namespace App\Http\Controllers\Export;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class DynamicExportController extends Controller
{
    /**
     * Entity mapping configuration
     *
     * @var array
     */
    protected $entityMap = [
        'empleados' => [
            'service' => \App\Services\Export\EmpleadosExportService::class,
            'request' => \App\Http\Requests\Export\EmpleadoExportRequest::class,
            'job' => \App\Jobs\Export\ExportEmpleadosJob::class,
        ],
        'empresas' => [
            'service' => \App\Services\Export\EmpresasExportService::class,
            'request' => \App\Http\Requests\Export\EmpresaExportRequest::class,
            'job' => \App\Jobs\Export\ExportEmpresasJob::class,
        ],
        'usuarios' => [
            'service' => \App\Services\Export\UsuariosExportService::class,
            'request' => \App\Http\Requests\Export\UsuarioExportRequest::class,
            'job' => \App\Jobs\Export\ExportUsuariosJob::class,
        ],
        'centros' => [
            'service' => \App\Services\Export\CentrosExportService::class,
            'request' => \App\Http\Requests\Export\CentroExportRequest::class,
            'job' => \App\Jobs\Export\ExportCentrosJob::class,
        ],
        'departamentos' => [
            'service' => \App\Services\Export\DepartamentosExportService::class,
            'request' => \App\Http\Requests\Export\DepartamentoExportRequest::class,
            'job' => \App\Jobs\Export\ExportDepartamentosJob::class,
        ],
        'asignaciones' => [
            'service' => \App\Services\Export\AsignacionesExportService::class,
            'request' => \App\Http\Requests\Export\AsignacionExportRequest::class,
            'job' => \App\Jobs\Export\ExportAsignacionesJob::class,
        ],
        'contratos' => [
            'service' => \App\Services\Export\ContratosExportService::class,
            'request' => \App\Http\Requests\Export\ContratoExportRequest::class,
            'job' => \App\Jobs\Export\ExportContratosJob::class,
        ],
        'horarios' => [
            'service' => \App\Services\Export\HorariosExportService::class,
            'request' => \App\Http\Requests\Export\HorarioExportRequest::class,
            'job' => \App\Jobs\Export\ExportHorariosJob::class,
        ],
    ];

    /**
     * Handle export request for any entity
     *
     * @param Request $request
     * @param string $entity
     * @param string $format
     * @return \Illuminate\Http\Response|JsonResponse
     */
    public function export(Request $request, string $entity, string $format)
    {
        // Validar que la entidad existe
        if (!isset($this->entityMap[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada para exportación',
                'supported_entities' => array_keys($this->entityMap)
            ], 400);
        }

        try {
            $entityConfig = $this->entityMap[$entity];
            $service = app($entityConfig['service']);
            $requestClass = $entityConfig['request'];

            $validated = app($requestClass)->validated();
            $filters = $validated['filters'];
            $selectedRows = $validated['selectedRows'];
            $sorting = $validated['sorting'];
            $columnVisibility = $validated['columnVisibility'];
            $exportType = $validated['exportType'];
            $totalRows = $validated['totalRows'];
            $hasManualSelection = $validated['hasManualSelection'];
            $manualSelectionCount = $validated['manualSelectionCount'];
            $sortedRowsCount = $validated['sortedRowsCount'];

            // Obtener estadísticas para decidir si usar cola
            $stats = $service->getQueryStats($filters, $selectedRows, $sorting);
            $useQueue = $stats['total_records'] > config("queue-exports.default_export_max_records", 100);

            if ($useQueue) {
                return $this->handleQueueExport($entity, $entityConfig, $filters, $selectedRows, $sorting, $columnVisibility, $format, $exportType);
            } else {
                return $this->handleDirectExport($service, $filters, $selectedRows, $sorting, $columnVisibility, $format, $exportType);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error durante la exportación',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle direct export (no queue)
     *
     * @param \App\Services\Export\BaseExportService $service Clase abstracta heredada por servicios específicos
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param array $columnVisibility
     * @param string $exportFormat
     * @param string $exportType
     * @return \Illuminate\Http\Response
     */
    protected function handleDirectExport($service, array $filters, array $selectedRows, array $sorting, array $columnVisibility, string $exportFormat, string $exportType)
    {
        $collection = $service->getExportData($filters, $selectedRows, $sorting, $columnVisibility, $exportType);
        $resourceClass = $service->getResourceClass();
        $filename = $service->getFilename();
        $visibleColumns = $service->mapVisibleColumns($columnVisibility);

        $entitySheetNames = [
            'empleados' => function ($id) {
                $empleado = \App\Models\Empleado::find($id);
                if (!$empleado) return 'Empleado';
                $nombre = trim($empleado->nombre . ' ' . $empleado->primer_apellido . ($empleado->segundo_apellido ? ' ' . $empleado->segundo_apellido : ''));
                return mb_substr($nombre, 0, 31);
            },
            'empresas' => function ($id) {
                $empresa = \App\Models\Empresa::find($id);
                return $empresa ? mb_substr($empresa->nombre, 0, 31) : 'Empresa';
            },
            'usuarios' => function ($id) {
                $usuario = \App\Models\User::find($id);
                return $usuario ? mb_substr($usuario->name ?? $usuario->nombre, 0, 31) : 'Usuario';
            },
            'centros' => function ($id) {
                $centro = \App\Models\Centro::find($id);
                return $centro ? mb_substr($centro->nombre, 0, 31) : 'Centro';
            },
            'departamentos' => function ($id) {
                $dep = \App\Models\Departamento::find($id);
                return $dep ? mb_substr($dep->nombre, 0, 31) : 'Departamento';
            },
            'contratos' => function ($id) {
                $contrato = \App\Models\Contrato::find($id);
                return $contrato ? ('Contrato ' . $contrato->n_expediente ?? $contrato->id) : 'Contrato';
            },
            'asignaciones' => function ($id) {
                $asig = \App\Models\Asignacion::find($id);
                return $asig ? mb_substr($asig->nombre, 0, 31) : 'Asignacion';
            },
        ];

        $entity = request()->route('entity');
        $isHorarios = $service instanceof \App\Services\Export\HorariosExportService;

        if ($isHorarios && count($selectedRows) > 1) {
            if ($exportFormat === 'csv') {
                // Para CSV, usar un exportador especial que combine todos los datos en una hoja
                $export = new \App\Exports\HorariosCSVExport($selectedRows, $visibleColumns, $filename);
            } else {
                // Para XLSX, usar el exportador multi-hoja
                $export = new \App\Exports\HorariosPorEmpleadoExport($selectedRows, $visibleColumns, $filename);
            }
        } elseif ($isHorarios && count($selectedRows) === 1) {
            $sheetTitle = $entitySheetNames['empleados']($selectedRows[0]);
            $export = new \App\Exports\ResourceExport($collection, $resourceClass, $filename, $visibleColumns, $sheetTitle);
        } elseif (isset($entitySheetNames[$entity]) && count($selectedRows) === 1) {
            $sheetTitle = $entitySheetNames[$entity]($selectedRows[0]);
            $export = new \App\Exports\ResourceExport($collection, $resourceClass, $filename, $visibleColumns, $sheetTitle);
        } else {
            // Nombre por defecto: nombre de la entidad
            $sheetTitle = ucfirst($entity);
            $export = new \App\Exports\ResourceExport($collection, $resourceClass, $filename, $visibleColumns, $sheetTitle);
        }

        if ($exportFormat === 'csv') {
            $filename = preg_replace('/\\.xlsx$/', '.csv', $filename);
            $response = Excel::download($export, $filename, \Maatwebsite\Excel\Excel::CSV);
            $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        } else {
            $response = Excel::download($export, $filename);
        }

        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        return $response;
    }

    /**
     * Handle queue export
     *
     * @param string $entity
     * @param array $entityConfig
     * @param array $filters
     * @param array $selectedRows
     * @param array $sorting
     * @param array $columnVisibility
     * @param string $exportFormat
     * @param string $exportType
     * @return JsonResponse
     */
    protected function handleQueueExport(string $entity, array $entityConfig, array $filters, array $selectedRows, array $sorting, array $columnVisibility, string $exportFormat, string $exportType)
    {
        $userId = Auth::id();
        $filename = "export_{$entity}_" . now()->format('Y-m-d_H-i-s') . '.' . $exportFormat;
        $jobClass = $entityConfig['job'];

        $jobClass::dispatch($userId, $filename, $exportFormat, $columnVisibility, $filters, $selectedRows, $sorting, $exportType);

        return response()->json([
            'message' => "La exportación de {$entity} ha sido encolada. Recibirás una notificación cuando esté lista.",
            'filename' => $filename,
            'entity' => $entity
        ], 202);
    }

    /**
     * Get export statistics
     *
     * @param Request $request
     * @param string $entity
     * @return JsonResponse
     */
    public function getStats(Request $request, string $entity): JsonResponse
    {
        if (!isset($this->entityMap[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada',
                'supported_entities' => array_keys($this->entityMap)
            ], 400);
        }

        try {
            $entityConfig = $this->entityMap[$entity];
            $service = app($entityConfig['service']);
            $requestClass = $entityConfig['request'];

            $filters = $request->input('filters', []);
            $selectedRows = $request->input('selectedRows', []);
            $sorting = $request->input('sorting', []);

            $stats = $service->getQueryStats($filters, $selectedRows, $sorting);

            return response()->json([
                'entity' => $entity,
                'stats' => $stats,
                'suggested_indexes' => $service->getSuggestedIndexes()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error obteniendo estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supported export formats
     *
     * @return JsonResponse
     */
    public function getSupportedFormats(): JsonResponse
    {
        return response()->json([
            'formats' => ['xlsx', 'csv'],
            'default_format' => 'xlsx',
            'supported_entities' => array_keys($this->entityMap)
        ]);
    }

    /**
     * Get recent export files
     *
     * @param Request $request
     * @param string $entity
     * @return JsonResponse
     */
    public function getRecentFiles(Request $request, string $entity): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener archivos recientes del directorio exports
            $files = Storage::disk('public')->files('exports');

            // Filtrar archivos que coincidan con el patrón de la entidad
            $entityFiles = array_filter($files, function ($file) use ($entity) {
                return strpos($file, "export_{$entity}_") !== false;
            });

            // Ordenar por fecha de modificación (más reciente primero)
            usort($entityFiles, function ($a, $b) {
                $timeA = Storage::disk('public')->lastModified($a);
                $timeB = Storage::disk('public')->lastModified($b);
                return $timeB - $timeA;
            });

            // Tomar solo los 5 archivos más recientes
            $recentFiles = array_slice($entityFiles, 0, 5);

            $filesData = array_map(function ($file) {
                return [
                    'filename' => basename($file),
                    'downloadUrl' => Storage::url($file),
                    'size' => Storage::disk('public')->size($file),
                    'modified' => Storage::disk('public')->lastModified($file)
                ];
            }, $recentFiles);

            return response()->json([
                'entity' => $entity,
                'files' => $filesData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get export page information
     *
     * @param Request $request
     * @param string $entity
     * @return JsonResponse
     */
    public function index(Request $request, string $entity): JsonResponse
    {
        if (!isset($this->entityMap[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada',
                'supported_entities' => array_keys($this->entityMap)
            ], 400);
        }

        try {
            $entityConfig = $this->entityMap[$entity];
            $service = app($entityConfig['service']);

            return response()->json([
                'entity' => $entity,
                'supported_formats' => ['xlsx', 'csv'],
                'default_format' => 'xlsx',
                'available_columns' => $service->getAvailableColumns(),
                'suggested_indexes' => $service->getSuggestedIndexes()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error obteniendo información de exportación',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download export file
     *
     * @param Request $request
     * @param string $entity
     * @param string $filename
     * @return JsonResponse
     */
    public function download(Request $request, string $entity, string $filename)
    {
        try {
            $filePath = "exports/{$filename}";

            if (!Storage::disk('public')->exists($filePath)) {
                return response()->json([
                    'error' => 'Archivo no encontrado'
                ], 404);
            }

            $fileUrl = Storage::url($filePath);

            return response()->json([
                'download_url' => $fileUrl,
                'filename' => $filename,
                'entity' => $entity
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar la descarga',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check export status
     *
     * @param Request $request
     * @param string $entity
     * @return JsonResponse
     */
    public function checkStatus(Request $request, string $entity): JsonResponse
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener archivos recientes del directorio exports para esta entidad
            $files = Storage::disk('public')->files('exports');

            // Filtrar archivos que coincidan con el patrón de la entidad
            $entityFiles = array_filter($files, function ($file) use ($entity) {
                return strpos($file, "export_{$entity}_") !== false;
            });

            // Ordenar por fecha de modificación (más reciente primero)
            usort($entityFiles, function ($a, $b) {
                $timeA = Storage::disk('public')->lastModified($a);
                $timeB = Storage::disk('public')->lastModified($b);
                return $timeB - $timeA;
            });

            // Tomar solo los 10 archivos más recientes
            $recentFiles = array_slice($entityFiles, 0, 10);

            $filesData = array_map(function ($file) {
                return [
                    'filename' => basename($file),
                    'downloadUrl' => Storage::url($file),
                    'size' => Storage::disk('public')->size($file),
                    'modified' => Storage::disk('public')->lastModified($file),
                    'exists' => true
                ];
            }, $recentFiles);

            return response()->json([
                'entity' => $entity,
                'files' => $filesData,
                'total_files' => count($filesData),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error verificando estado de exportaciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
