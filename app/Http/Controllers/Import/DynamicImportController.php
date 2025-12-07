<?php

namespace App\Http\Controllers\Import;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class DynamicImportController extends Controller
{
    /**
     * Mapeo dinámico de entidades que se carga desde permissions.json
     * @var array
     */
    private $dynamicEntityMap = null;

    /**
     * Obtiene la clase de servicio para una entidad
     * 
     * @param string $entity
     * @return string|null
     */
    private function getServiceClass(string $entity): ?string
    {
        $serviceMap = [
            'empleados' => \App\Services\Import\EmpleadoImportService::class,
            'empresas' => \App\Services\Import\EmpresaImportService::class,
            'usuarios' => \App\Services\Import\UsuarioImportService::class,
            'centros' => \App\Services\Import\CentroImportService::class,
            'departamentos' => \App\Services\Import\DepartamentoImportService::class,
            'asignaciones' => \App\Services\Import\AsignacionImportService::class,
            'contratos' => \App\Services\Import\ContratoImportService::class,
        ];

        return $serviceMap[$entity] ?? null;
    }

    /**
     * Obtiene el mapeo dinámico de entidades desde el archivo de permisos
     * 
     * @return array
     */
    private function getEntityMap(): array
    {
        if ($this->dynamicEntityMap !== null) {
            return $this->dynamicEntityMap;
        }

        try {
            $jsonPath = database_path('data/permissions.json');
            
            if (!file_exists($jsonPath)) {
                throw new \Exception('Archivo de permisos no encontrado');
            }

            $jsonContent = file_get_contents($jsonPath);
            $permissionsData = json_decode($jsonContent, true);

            if (!$permissionsData || !isset($permissionsData['permissions'])) {
                throw new \Exception('Estructura de permisos inválida');
            }

            // Construir el mapeo dinámico basado en los permisos existentes
            $dynamicMap = [];
            $importPermissions = [];
            $exportPermissions = [];

            foreach ($permissionsData['permissions'] as $permission) {
                if (!isset($permission['name'])) {
                    continue;
                }

                $permissionName = $permission['name'];
                
                // Detectar permisos de importación
                if (preg_match('/^import([A-Z][a-zA-Z]+)$/', $permissionName, $matches)) {
                    $entity = $this->convertToEntityName($matches[1]);
                    $importPermissions[$entity] = $permissionName;
                }
                
                // Detectar permisos de exportación
                if (preg_match('/^export([A-Z][a-zA-Z]+)$/', $permissionName, $matches)) {
                    $entity = $this->convertToEntityName($matches[1]);
                    $exportPermissions[$entity] = $permissionName;
                }
            }

            // Construir el mapeo final solo para entidades que tengan ambos permisos y clases válidas
            foreach ($importPermissions as $entity => $importPerm) {
                if (isset($exportPermissions[$entity])) {
                    $serviceClass = $this->getServiceClass($entity);
                    $requestClass = $this->getRequestClass($entity);
                    
                    if ($serviceClass && $requestClass) {
                        $dynamicMap[$entity] = [
                            'service' => $serviceClass,
                            'request' => $requestClass,
                            'import_permission' => $importPerm,
                            'export_permission' => $exportPermissions[$entity],
                        ];
                    }
                }
            }

            $this->dynamicEntityMap = $dynamicMap;
            return $dynamicMap;

        } catch (\Exception $e) {
            Log::error('Error construyendo mapeo dinámico de entidades', [
                'error' => $e->getMessage()
            ]);

            // Fallback al mapeo estático si falla la carga dinámica
            $this->dynamicEntityMap = $this->getStaticEntityMap();
            return $this->dynamicEntityMap;
        }
    }

    /**
     * Convierte el nombre de la entidad del permiso al nombre usado en el frontend
     * 
     * @param string $entityFromPermission
     * @return string
     */
    private function convertToEntityName(string $entityFromPermission): string
    {
        $conversions = [
            'Employees' => 'empleados',
            'Companies' => 'empresas',
            'Users' => 'usuarios',
            'Centers' => 'centros', 
            'Departments' => 'departamentos',
            'Assignments' => 'asignaciones',
            'Contracts' => 'contratos',
            'Permissions' => 'permisos',
            'Roles' => 'roles',
            'Modules' => 'modulos',
            'Links' => 'enlaces',
            'Teams' => 'equipos',
            'Municipios' => 'municipios',
            'Provincias' => 'provincias',
            'Festivos' => 'festivos'
        ];

        return $conversions[$entityFromPermission] ?? strtolower($entityFromPermission);
    }

    /**
     * Obtiene la clase de request para una entidad
     * 
     * @param string $entity
     * @return string
     */
    private function getRequestClass(string $entity): ?string
    {
        $requestMap = [
            'empleados' => \App\Http\Requests\Import\EmpleadoImportRequest::class,
            'empresas' => \App\Http\Requests\Import\EmpresaImportRequest::class,
            'usuarios' => \App\Http\Requests\Import\UsuarioImportRequest::class,
            'centros' => \App\Http\Requests\Import\CentroImportRequest::class,
            'departamentos' => \App\Http\Requests\Import\DepartamentoImportRequest::class,
            'asignaciones' => \App\Http\Requests\Import\AsignacionImportRequest::class,
            'contratos' => \App\Http\Requests\Import\ContratoImportRequest::class,
        ];

        return $requestMap[$entity] ?? null;
    }

    /**
     * Mapeo estático como fallback
     * 
     * @return array
     */
    private function getStaticEntityMap(): array
    {
        return [
            'empleados' => [
                'service' => \App\Services\Import\EmpleadoImportService::class,
                'request' => \App\Http\Requests\Import\EmpleadoImportRequest::class,
                'import_permission' => 'importEmployees',
                'export_permission' => 'exportEmployees',
            ],
            'empresas' => [
                'service' => \App\Services\Import\EmpresaImportService::class,
                'request' => \App\Http\Requests\Import\EmpresaImportRequest::class,
                'import_permission' => 'importCompanies',
                'export_permission' => 'exportCompanies',
            ],
            'usuarios' => [
                'service' => \App\Services\Import\UsuarioImportService::class,
                'request' => \App\Http\Requests\Import\UsuarioImportRequest::class,
                'import_permission' => 'importUsers',
                'export_permission' => 'exportUsers',
            ],
            'centros' => [
                'service' => \App\Services\Import\CentroImportService::class,
                'request' => \App\Http\Requests\Import\CentroImportRequest::class,
                'import_permission' => 'importCenters',
                'export_permission' => 'exportCenters',
            ],
            'departamentos' => [
                'service' => \App\Services\Import\DepartamentoImportService::class,
                'request' => \App\Http\Requests\Import\DepartamentoImportRequest::class,
                'import_permission' => 'importDepartments',
                'export_permission' => 'exportDepartments',
            ],
            'asignaciones' => [
                'service' => \App\Services\Import\AsignacionImportService::class,
                'request' => \App\Http\Requests\Import\AsignacionImportRequest::class,
                'import_permission' => 'importAssignments',
                'export_permission' => 'exportAssignments',
            ],
            'contratos' => [
                'service' => \App\Services\Import\ContratoImportService::class,
                'request' => \App\Http\Requests\Import\ContratoImportRequest::class,
                'import_permission' => 'importContracts',
                'export_permission' => 'exportContracts',
            ],
        ];
    }

    /**
     * Obtiene el esquema para una entidad específica
     */
    public function getSchema(Request $request, string $entity): JsonResponse
    {
        // Validar que la entidad existe
        $entityMap = $this->getEntityMap();
        if (!isset($entityMap[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada',
                'supported_entities' => array_keys($entityMap)
            ], 400);
        }

        $entityConfig = $entityMap[$entity];

        // Validar permisos - para obtener el esquema necesita permisos de importación
        if (isset($entityConfig['import_permission'])) {
            $user = Auth::user();
            if ($user) {
                try {
                    if (!$user->hasPermissionTo($entityConfig['import_permission'], 'web')) {
                        return response()->json([
                            'error' => 'No tienes permisos para obtener el esquema de esta entidad',
                            'required_permission' => $entityConfig['import_permission']
                        ], 403);
                    }
                } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                    Log::warning("[DynamicImport] Permiso no existe en base de datos", [
                        'permission' => $entityConfig['import_permission'],
                        'entity' => $entity,
                        'message' => $e->getMessage()
                    ]);
                    // Continuar sin validación de permisos si el permiso no existe
                }
            }
        }

        try {
            // Validar que la configuración del servicio esté completa
            if (!isset($entityConfig['service']) || !$entityConfig['service']) {
                return response()->json([
                    'error' => 'Servicio no configurado para esta entidad',
                    'entity' => $entity
                ], 500);
            }

            $service = app($entityConfig['service']);
            
            $schema = $service->getSchema();
            

            return response()->json($schema);

        } catch (\Exception $e) {
            Log::error("[DynamicImport] Error al obtener esquema", [
                'entity' => $entity,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al obtener el esquema',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descarga la plantilla para una entidad específica
     */
    public function downloadTemplate(Request $request, string $entity): mixed
    {
        $format = $request->get('format', 'xlsx');
        
        // Validar que la entidad existe
        if (!isset($this->getEntityMap()[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada',
                'supported_entities' => array_keys($this->getEntityMap())
            ], 400);
        }

        $entityConfig = $this->getEntityMap()[$entity];

        // Validar permisos de exportación
        if (isset($entityConfig['export_permission'])) {
            $user = Auth::user();
            if ($user) {
                try {
                    if (!$user->hasPermissionTo($entityConfig['export_permission'], 'web')) {
                        return response()->json([
                            'error' => 'No tienes permisos para exportar datos de esta entidad',
                            'required_permission' => $entityConfig['export_permission']
                        ], 403);
                    }
                } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                    Log::warning("[DynamicImport] Permiso de exportación no existe en base de datos", [
                        'permission' => $entityConfig['export_permission'],
                        'entity' => $entity,
                        'message' => $e->getMessage()
                    ]);
                    // Continuar sin validación de permisos si el permiso no existe
                }
            }
        }

        try {
            // Validar que la configuración del servicio esté completa
            if (!isset($entityConfig['service']) || !$entityConfig['service']) {
                return response()->json([
                    'error' => 'Servicio no configurado para esta entidad',
                    'entity' => $entity
                ], 500);
            }

            $service = app($entityConfig['service']);
            
            // Usar el sistema dinámico unificado para todas las entidades
            $templateData = $service->getTemplateData();
            $filename = "plantilla_{$entity}." . $format;
            
            if ($format === 'csv') {
                $response = Excel::download(
                    new \App\Exports\TemplateExport($templateData), 
                    $filename, 
                    \Maatwebsite\Excel\Excel::CSV
                );
            } else {
                $response = Excel::download(
                    new \App\Exports\TemplateExport($templateData), 
                    $filename
                );
            }

            return $response;

        } catch (\Exception $e) {
            Log::error("[Template Error]", [
                'entity' => $entity,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al generar la plantilla',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesa la importación
     */
    public function import(Request $request, string $entity): JsonResponse
    {
        // Log::info("[DynamicImport] Iniciando importación", [
        //     'entity' => $entity,
        //     'user_id' => Auth::id()
        // ]);

        // Validar que la entidad existe
        if (!isset($this->getEntityMap()[$entity])) {
            Log::error("[DynamicImport] Entidad no soportada", ['entity' => $entity]);
            return response()->json([
                'error' => 'Entidad no soportada para importación',
                'supported_entities' => array_keys($this->getEntityMap())
            ], 400);
        }

        $entityConfig = $this->getEntityMap()[$entity];

        // Validar permisos de importación
        if (isset($entityConfig['import_permission'])) {
            $user = Auth::user();
            if ($user) {
                try {
                    if (!$user->hasPermissionTo($entityConfig['import_permission'], 'web')) {
                        return response()->json([
                            'error' => 'No tienes permisos para importar datos de esta entidad',
                            'required_permission' => $entityConfig['import_permission']
                        ], 403);
                    }
                } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                    Log::warning("[DynamicImport] Permiso de importación no existe en base de datos", [
                        'permission' => $entityConfig['import_permission'],
                        'entity' => $entity,
                        'message' => $e->getMessage()
                    ]);
                    // Continuar sin validación de permisos si el permiso no existe
                }
            }
        }

        try {
            // Validar que la configuración del servicio esté completa
            if (!isset($entityConfig['service']) || !$entityConfig['service']) {
                return response()->json([
                    'error' => 'Servicio no configurado para esta entidad',
                    'entity' => $entity
                ], 500);
            }

            if (!isset($entityConfig['request']) || !$entityConfig['request']) {
                return response()->json([
                    'error' => 'Request no configurado para esta entidad',
                    'entity' => $entity
                ], 500);
            }

            $service = app($entityConfig['service']);
            $requestClass = $entityConfig['request'];

            // Validar la request
            $validated = app($requestClass)->validated();
            
            $result = $service->processImport($validated);

            Log::info("[DynamicImport] Importación completada", [
                'entity' => $entity,
                'success_count' => $result['success_count'] ?? 0,
                'error_count' => $result['error_count'] ?? 0
            ]);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error("[DynamicImport] Error en importación", [
                'entity' => $entity,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error durante la importación',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesa la importación desde datos JSON (para compatibilidad con frontend existente)
     */
    public function importFromJson(Request $request, string $entity): JsonResponse
    {
        // Validar que la entidad existe
        if (!isset($this->getEntityMap()[$entity])) {
            return response()->json([
                'error' => 'Entidad no soportada',
                'supported_entities' => array_keys($this->getEntityMap())
            ], 400);
        }

        $entityConfig = $this->getEntityMap()[$entity];

        // Validar permisos de importación
        if (isset($entityConfig['import_permission'])) {
            $user = Auth::user();
            if ($user) {
                try {
                    if (!$user->hasPermissionTo($entityConfig['import_permission'], 'web')) {
                        return response()->json([
                            'error' => 'No tienes permisos para importar datos de esta entidad',
                            'required_permission' => $entityConfig['import_permission']
                        ], 403);
                    }
                } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                    Log::warning("[DynamicImport] Permiso de importación no existe en base de datos (JSON)", [
                        'permission' => $entityConfig['import_permission'],
                        'entity' => $entity,
                        'message' => $e->getMessage()
                    ]);
                    // Continuar sin validación de permisos si el permiso no existe
                }
            }
        }

        try {
            // Validar que la configuración del servicio esté completa
            if (!isset($entityConfig['service']) || !$entityConfig['service']) {
                return response()->json([
                    'error' => 'Servicio no configurado para esta entidad',
                    'entity' => $entity
                ], 500);
            }

            $service = app($entityConfig['service']);

            // Validar datos JSON
            $validatedData = $request->validate([
                'data' => 'required|array',
                'createUsers' => 'array'
            ]);

            // Para empleados, procesamos los datos con el método legacy que acepta datos JSON
            if ($entity === 'empleados') {
                $result = $service->processImport($validatedData['data'], $validatedData['createUsers'] ?? []);
            } else {
                // Para otras entidades, usar el método genérico con validación de duplicados
                $result = $service->processImportGeneric($validatedData);
            }

            Log::info("[DynamicImport] Importación desde JSON completada", [
                'entity' => $entity,
                'success_count' => $result['imported'] ?? $result['success_count'] ?? 0,
                'error_count' => count($result['invalidRows'] ?? $result['errors'] ?? [])
            ]);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error("[DynamicImport] Error en importación desde JSON", [
                'entity' => $entity,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error durante la importación',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene los formatos soportados
     */
    public function getSupportedFormats(): JsonResponse
    {
        return response()->json([
            'formats' => ['xlsx', 'csv'],
            'default' => 'xlsx'
        ]);
    }

    /**
     * Método para mantener compatibilidad con empleados
     * Este método específico permite que el frontend existente siga funcionando
     */
    public function catalogos(): JsonResponse
    {
        try {
            $catalogos = [
                'tiposDocumento' => \App\Models\TipoDocumento::all(),
                'tiposEmpleado' => \App\Models\TipoEmpleado::all(),
                'estadosEmpleado' => \App\Models\EstadoEmpleado::all(),
                'generos' => \App\Models\Genero::all(),
            ];
            
            return response()->json($catalogos);
        } catch (\Exception $e) {
            Log::error("[DynamicImport] Error al obtener catálogos de empleados", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener catálogos',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
