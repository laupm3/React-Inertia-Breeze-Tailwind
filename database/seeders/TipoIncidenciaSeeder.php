<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoIncidencia;
use App\Models\Module;
use Illuminate\Support\Facades\Log;

class TipoIncidenciaSeeder extends Seeder
{
    public function run(): void
    {
        // Crear módulos si no existen
        $this->createModulesIfNotExist();

        // Obtener módulos
        $empleadosModule = Module::where('name', 'empleados')->first();
        $contratosModule = Module::where('name', 'contratos')->first();
        $usuariosModule = Module::where('name', 'users')->first();
        $centrosModule = Module::where('name', 'centros')->first();
        $administracionModule = Module::where('name', 'administracion')->first();

        $tiposIncidencia = [
            // Tipos para módulo administracion
            [
                'module_id' => $administracionModule?->id,
                'name' => 'Permisos',
                'description' => 'Incidencias relacionadas con los permisos de un administrador',
                'code' => 'administracion_permiso',
                'is_active' => true,
                'sort_order' => 1,
            ],
            // Tipos para módulo empleados
            [
                'module_id' => $empleadosModule?->id,
                'name' => 'Roles y Permisos',
                'description' => 'Incidencias relacionadas con roles y permisos de empleados',
                'code' => 'empleados_roles',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'module_id' => $empleadosModule?->id,
                'name' => 'Horarios',
                'description' => 'Incidencias relacionadas con horarios de trabajo',
                'code' => 'empleados_horarios',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'module_id' => $empleadosModule?->id,
                'name' => 'Datos Personales',
                'description' => 'Incidencias relacionadas con datos personales',
                'code' => 'empleados_datos',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'module_id' => $empleadosModule?->id,
                'name' => 'Fichajes',
                'description' => 'Incidencias relacionadas con fichajes y asistencia',
                'code' => 'empleados_fichajes',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'module_id' => $empleadosModule?->id,
                'name' => 'Permisos',
                'description' => 'Incidencias relacionadas con solicitudes de permisos',
                'code' => 'empleados_permisos',
                'is_active' => true,
                'sort_order' => 5,
            ],

            // Tipos para módulo contratos
            [
                'module_id' => $contratosModule?->id,
                'name' => 'Condiciones',
                'description' => 'Incidencias relacionadas con condiciones contractuales',
                'code' => 'contratos_condiciones',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'module_id' => $contratosModule?->id,
                'name' => 'Renovaciones',
                'description' => 'Incidencias relacionadas con renovaciones de contratos',
                'code' => 'contratos_renovaciones',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'module_id' => $contratosModule?->id,
                'name' => 'Terminaciones',
                'description' => 'Incidencias relacionadas con terminaciones de contratos',
                'code' => 'contratos_terminaciones',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'module_id' => $contratosModule?->id,
                'name' => 'Anexos',
                'description' => 'Incidencias relacionadas con anexos contractuales',
                'code' => 'contratos_anexos',
                'is_active' => true,
                'sort_order' => 4,
            ],

            // Tipos para módulo usuarios
            [
                'module_id' => $usuariosModule?->id,
                'name' => 'Acceso',
                'description' => 'Incidencias relacionadas con acceso al sistema',
                'code' => 'usuarios_acceso',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'module_id' => $usuariosModule?->id,
                'name' => 'Autenticación',
                'description' => 'Incidencias relacionadas con autenticación',
                'code' => 'usuarios_autenticacion',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'module_id' => $usuariosModule?->id,
                'name' => 'Perfil',
                'description' => 'Incidencias relacionadas con perfil de usuario',
                'code' => 'usuarios_perfil',
                'is_active' => true,
                'sort_order' => 3,
            ],

            // Tipos para módulo centros
            [
                'module_id' => $centrosModule?->id,
                'name' => 'Configuración',
                'description' => 'Incidencias relacionadas con configuración de centros',
                'code' => 'centros_configuracion',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'module_id' => $centrosModule?->id,
                'name' => 'Departamentos',
                'description' => 'Incidencias relacionadas con departamentos',
                'code' => 'centros_departamentos',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'module_id' => $centrosModule?->id,
                'name' => 'Ubicación',
                'description' => 'Incidencias relacionadas con ubicación de centros',
                'code' => 'centros_ubicacion',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($tiposIncidencia as $tipo) {
            if (!$tipo['module_id']) {
                Log::warning("No se pudo crear tipo de incidencia '{$tipo['name']}' - módulo no encontrado");
                $skipped++;
                continue;
            }

            // Verificar si ya existe
            $existing = TipoIncidencia::where('code', $tipo['code'])->first();
            if ($existing) {
                Log::info("Tipo de incidencia '{$tipo['code']}' ya existe, saltando...");
                $skipped++;
                continue;
            }

            try {
                TipoIncidencia::create($tipo);
                $created++;
                Log::info("Tipo de incidencia '{$tipo['name']}' creado exitosamente");
            } catch (\Exception $e) {
                Log::error("Error creando tipo de incidencia '{$tipo['name']}': " . $e->getMessage());
                $skipped++;
            }
        }

        Log::info("TipoIncidenciaSeeder completado: {$created} creados, {$skipped} saltados");
    }

    private function createModulesIfNotExist(): void
    {
        $modules = [
            ['name' => 'empleados', 'description' => 'Employee module - Habilita la gestión de empleados'],
            ['name' => 'contratos', 'description' => 'Contract module - Habilita la gestión de contratos'],
            ['name' => 'users', 'description' => 'User module - Habilita la gestión de usuarios'],
            ['name' => 'centros', 'description' => 'Center module - Habilita la gestión de centros'],
        ];

        foreach ($modules as $module) {
            Module::firstOrCreate(
                ['name' => $module['name']],
                $module
            );
        }
    }
}
