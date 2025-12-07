<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para manejar permisos de usuario con cache optimizado
 * 
 * Este controlador maneja la verificación de permisos para funcionalidades de importación y exportación.
 * Incluye un sistema de cache estático que optimiza el rendimiento al cargar el mapeo de permisos
 * solo una vez por ciclo de vida de la aplicación.
 * 
 * OPTIMIZACIONES IMPLEMENTADAS:
 * - ✅ Cache estático para mapeo de permisos (carga una sola vez)
 * - ✅ Cache estático para mapeo de fallback
 * - ✅ Métodos para limpieza y monitoreo del cache
 * 
 * CONFIGURACIÓN DE PERMISOS:
 * 
 * Para usar este sistema, necesitas configurar permisos en tu base de datos con el siguiente formato:
 * - {entidad}.export (ej: empleados.export, usuarios.export)
 * - {entidad}.import (ej: empleados.import, usuarios.import)
 * 
 * EJEMPLOS DE USO:
 * 
 * 1. Si usas Spatie Laravel Permission:
 *    - Crea permisos: empleados.export, empleados.import
 *    - Asigna permisos a roles o usuarios específicos
 * 
 * 2. Si usas Laravel Gates:
 *    - Define gates en AuthServiceProvider: Gate::define('empleados.export', ...)
 * 
 * 3. Para desarrollo temporal:
 *    - Modifica checkUserPermission() para permitir acceso basado en email, ID, etc.
 * 
 * 4. Para limpiar cache (útil en testing):
 *    - MigrationController::clearPermissionCache()
 * 
 * @see usePermissions.js - Hook de React que consume este endpoint
 * @see ImportExportDropdown.jsx - Componente que usa los permisos
 */
class MigrationController extends Controller
{
    /**
     * Cache estático para el mapeo de permisos
     * Se carga una sola vez y se reutiliza en todas las llamadas
     */
    private static ?array $permissionMappingCache = null;
    private static ?array $fallbackMappingCache = null;

    /**
     * Endpoint unificado que obtiene el mapeo de permisos y verifica los permisos del usuario
     * para una entidad específica en una sola solicitud
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function hasAccessMigrate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $entity = $request->route('entity'); // Obtener entidad desde la ruta
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            if (!$entity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no especificada'
                ], 400);
            }

            // Obtener el mapeo de permisos directamente desde el método interno
            $entityPermissions = $this->getPermissionMapping($entity);
            
            if (!$entityPermissions) {
                return response()->json([
                    'success' => false,
                    'message' => "No se encontraron permisos para la entidad: {$entity}"
                ], 404);
            }

            // Verificar los permisos del usuario
            $userPermissions = [
                'canImport' => $this->checkSpecificPermission($entityPermissions['import']),
                'canExport' => $this->checkSpecificPermission($entityPermissions['export'])
            ];

            Log::info('Entity permissions check', [
                'user_id' => $user->id,
                'entity' => $entity,
                'permissions' => $userPermissions,
                'permission_names' => $entityPermissions
            ]);

            return response()->json([
                'success' => true,
                'entity' => $entity,
                'permissions' => $userPermissions,
                'permissionNames' => $entityPermissions,
                'loading' => false
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error getting entity permissions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener permisos de entidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene el mapeo de permisos para una entidad específica
     * Lee dinámicamente desde permissions.json y usa cache estático
     *
     * @param string $entity
     * @return array|null
     */
    private function getPermissionMapping(string $entity): ?array
    {
        try {
            // Si el cache no está inicializado, cargarlo
            if (self::$permissionMappingCache === null) {
                $this->loadPermissionMappingCache();
            }

            // Buscar la entidad en el cache
            if (isset(self::$permissionMappingCache[$entity])) {
                return self::$permissionMappingCache[$entity];
            }

            // Si no está en el cache dinámico, usar fallback
            return $this->getFallbackPermissionMapping($entity);
            
        } catch (\Exception $e) {
            Log::error('Error reading permissions mapping', [
                'error' => $e->getMessage(),
                'entity' => $entity
            ]);
            
            return $this->getFallbackPermissionMapping($entity);
        }
    }

    /**
     * Carga el mapeo de permisos desde permissions.json al cache estático
     * Solo se ejecuta una vez por ciclo de vida de la aplicación
     */
    private function loadPermissionMappingCache(): void
    {
        try {
            $permissionsPath = database_path('data/permissions.json');
            
            if (!file_exists($permissionsPath)) {
                Log::warning('Permissions file not found, cache will remain empty');
                self::$permissionMappingCache = [];
                return;
            }

            $permissionsContent = file_get_contents($permissionsPath);
            $permissionsData = json_decode($permissionsContent, true);

            if (!$permissionsData || !is_array($permissionsData)) {
                Log::warning('Invalid permissions data, cache will remain empty');
                self::$permissionMappingCache = [];
                return;
            }

            // Construir el cache completo
            $cache = [];
            
            foreach ($permissionsData as $module => $moduleData) {
                if (isset($moduleData['entities']) && is_array($moduleData['entities'])) {
                    foreach ($moduleData['entities'] as $entityData) {
                        if (isset($entityData['name'])) {
                            $entityName = $entityData['name'];
                            $cache[$entityName] = [
                                'import' => $this->buildPermissionName($entityName, 'import'),
                                'export' => $this->buildPermissionName($entityName, 'export')
                            ];
                        }
                    }
                }
            }

            self::$permissionMappingCache = $cache;
            
            Log::info('Permission mapping cache loaded', [
                'entities_count' => count($cache),
                'entities' => array_keys($cache)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error loading permission mapping cache', [
                'error' => $e->getMessage()
            ]);
            
            self::$permissionMappingCache = [];
        }
    }

    /**
     * Construye el nombre del permiso basado en la entidad y acción
     *
     * @param string $entity
     * @param string $action
     * @return string
     */
    private function buildPermissionName(string $entity, string $action): string
    {
        // Mapeo de entidades a nombres de permisos
        $entityPermissionMap = [
            'empleados' => 'Employees',
            'empresas' => 'Companies', 
            'usuarios' => 'Users',
            'centros' => 'Centers',
            'departamentos' => 'Departments',
            'asignaciones' => 'Assignments',
            'contratos' => 'Contracts',
            'permisos' => 'Permissions',
            'roles' => 'Roles',
            'modulos' => 'Modules',
            'enlaces' => 'Links',
            'equipos' => 'Teams',
            'municipios' => 'Municipios',
            'provincias' => 'Provincias',
            'festivos' => 'Festivos',
            'horarios' => 'Horarios',
            'jornadas' => 'Jornadas',
            'turnos' => 'Turnos',
            'nominas' => 'Nominas'
        ];

        $permissionEntity = $entityPermissionMap[$entity] ?? ucfirst($entity);
        return $action . $permissionEntity;
    }

    /**
     * Mapeo de permisos de fallback cuando no se puede leer permissions.json
     * Usa cache estático para evitar recrear el array en cada llamada
     *
     * @param string $entity
     * @return array|null
     */
    private function getFallbackPermissionMapping(string $entity): ?array
    {
        // Inicializar cache de fallback si no existe
        if (self::$fallbackMappingCache === null) {
            self::$fallbackMappingCache = [
                'empleados' => ['import' => 'importEmployees', 'export' => 'exportEmployees'],
                'empresas' => ['import' => 'importCompanies', 'export' => 'exportCompanies'],
                'usuarios' => ['import' => 'importUsers', 'export' => 'exportUsers'],
                'centros' => ['import' => 'importCenters', 'export' => 'exportCenters'],
                'departamentos' => ['import' => 'importDepartments', 'export' => 'exportDepartments'],
                'asignaciones' => ['import' => 'importAssignments', 'export' => 'exportAssignments'],
                'contratos' => ['import' => 'importContracts', 'export' => 'exportContracts'],
                'permisos' => ['import' => 'importPermissions', 'export' => 'exportPermissions'],
                'roles' => ['import' => 'importRoles', 'export' => 'exportRoles'],
                'modulos' => ['import' => 'importModules', 'export' => 'exportModules'],
                'enlaces' => ['import' => 'importLinks', 'export' => 'exportLinks'],
                'equipos' => ['import' => 'importTeams', 'export' => 'exportTeams'],
                'municipios' => ['import' => 'importMunicipios', 'export' => 'exportMunicipios'],
                'provincias' => ['import' => 'importProvincias', 'export' => 'exportProvincias'],
                'festivos' => ['import' => 'importFestivos', 'export' => 'exportFestivos'],
                'horarios' => ['import' => 'importHorarios', 'export' => 'exportHorarios'],
                'jornadas' => ['import' => 'importJornadas', 'export' => 'exportJornadas'],
                'turnos' => ['import' => 'importTurnos', 'export' => 'exportTurnos'],
                'nominas' => ['import' => 'importNominas', 'export' => 'exportNominas']
            ];
        }

        return self::$fallbackMappingCache[$entity] ?? null;
    }

    /**
     * Verificar un permiso específico
     *
     * @param string $permission
     * @return bool
     */
    private function checkSpecificPermission(string $permission): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }
        
        // 1. Verificar si el usuario tiene el permiso específico usando Spatie Laravel Permission
        if (method_exists($user, 'hasPermissionTo')) {
            try {
                if ($user->hasPermissionTo($permission)) {
                    return true;
                }
            } catch (\Exception $e) {
                // Si falla, continúa con las siguientes verificaciones
            }
        }
        
        // 2. Verificar si el usuario tiene el permiso usando el método can()
        if (method_exists($user, 'can')) {
            try {
                if ($user->can($permission)) {
                    return true;
                }
            } catch (\Exception $e) {
                // Si falla, continúa con las siguientes verificaciones
            }
        }
        
        // 3. Verificar roles específicos que deberían tener acceso completo
        if (method_exists($user, 'hasRole')) {
            try {
                $adminRoles = ['admin', 'super_admin', 'administrador', 'super-admin', 'Super Admin'];
                foreach ($adminRoles as $role) {
                    if ($user->hasRole($role)) {
                        return true;
                    }
                }
            } catch (\Exception $e) {
                // Si falla, continúa con las siguientes verificaciones
            }
        }
        
        // 4. Verificar si el usuario tiene algún rol con permisos de administración
        if (method_exists($user, 'roles')) {
            $userRoles = $user->roles->pluck('name')->toArray();
            $adminRoles = ['admin', 'super_admin', 'administrador', 'super-admin', 'Super Admin'];
            
            foreach ($adminRoles as $adminRole) {
                if (in_array($adminRole, $userRoles)) {
                    return true;
                }
            }
        }
        
        // 5. Verificar permisos directos si el método existe
        if (method_exists($user, 'hasDirectPermission')) {
            try {
                if ($user->hasDirectPermission($permission)) {
                    return true;
                }
            } catch (\Exception $e) {
                // Si falla, continúa
            }
        }
        
        // 6. Lógica temporal para desarrollo - REMOVER EN PRODUCCIÓN
        // Permitir acceso basado en el email del usuario para pruebas
        if (in_array($user->email, [
            'doomsday@gmail.com',  // Super Admin
            'tysonpopluis@gmail.com', // Líder Desarrollo
            'admin@example.com',
            // Agrega aquí emails específicos que deben tener acceso durante desarrollo
        ])) {
            return true;
        }
        
        return false;
    }

    /**
     * Limpia el cache de mapeo de permisos
     * Útil para testing o cuando se actualiza permissions.json
     */
    public static function clearPermissionCache(): void
    {
        self::$permissionMappingCache = null;
        self::$fallbackMappingCache = null;
        Log::info('Permission mapping cache cleared');
    }

    /**
     * Verifica si el cache está cargado
     * Útil para debugging
     */
    public static function isCacheLoaded(): bool
    {
        return self::$permissionMappingCache !== null;
    }

    /**
     * Obtiene estadísticas del cache
     * Útil para debugging y monitoreo
     */
    public static function getCacheStats(): array
    {
        return [
            'is_loaded' => self::$permissionMappingCache !== null,
            'entities_count' => self::$permissionMappingCache ? count(self::$permissionMappingCache) : 0,
            'entities' => self::$permissionMappingCache ? array_keys(self::$permissionMappingCache) : [],
            'fallback_entities_count' => self::$fallbackMappingCache ? count(self::$fallbackMappingCache) : 0
        ];
    }
}