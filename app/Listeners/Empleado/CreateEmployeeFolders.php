<?php

namespace App\Listeners\Empleado;

use App\Events\Empleado\EmployeeCreated;
use App\Models\Folder;
use App\Models\NivelAcceso;
use App\Models\NivelSeguridad;
use App\Models\User;
use App\Services\Storage\DirectoryManagementService;
use App\Services\Storage\FileUploadService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateEmployeeFolders implements ShouldQueue
{
    protected DirectoryManagementService $directoryService;
    protected FileUploadService $fileUploadService;
    protected $nivelesSeguridad;
    protected $nivelesAcceso;

    public function handle(EmployeeCreated $event): void
    {
        Log::info('📁 Creando carpetas para empleado', [
            'empleado_id' => $event->empleado->id,
            'empleado_nif' => $event->empleado->nif,
            'empleado_nombre' => $event->empleado->nombre . ' ' . $event->empleado->primer_apellido
        ]);

        try {
            // Inicializar servicios
            $this->directoryService = app(DirectoryManagementService::class);
            $this->fileUploadService = app(FileUploadService::class);

            // Obtener datos de referencia
            $this->nivelesSeguridad = NivelSeguridad::all()->keyBy('nombre');
            $this->nivelesAcceso = NivelAcceso::all()->keyBy('nombre');

            // Verificar que el empleado tenga usuario asociado
            $user = $event->empleado->user;
            if (!$user) {
                Log::warning("Empleado {$event->empleado->nif} no tiene usuario asociado, no se crearán carpetas");
                return;
            }

            // Obtener la carpeta de empleados
            $carpetaEmpleados = Folder::where('path', 'hr/Empleados')->first();
            if (!$carpetaEmpleados) {
                Log::error('No se encontró la carpeta de Empleados');
                return;
            }

            // Crear carpeta principal del empleado
            $carpetaEmpleado = $this->directoryService->createSubdirectory(
                $carpetaEmpleados,
                $event->empleado->nif,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta del empleado {$event->empleado->nombre} {$event->empleado->primer_apellido}",
                    'user_id' => $user->id
                ],
                $event->actor ?? $user
            );

            // Crear subcarpetas principales
            $this->createEmployeeSubfolders($carpetaEmpleado, $user, $event->actor ?? $user);

            Log::info('✅ Carpetas del empleado creadas exitosamente', [
                'empleado_id' => $event->empleado->id,
                'carpeta_empleado_id' => $carpetaEmpleado->id
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error creando carpetas del empleado', [
                'empleado_id' => $event->empleado->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Crea las subcarpetas para un empleado específico
     */
    protected function createEmployeeSubfolders(Folder $carpetaEmpleado, User $user, User $actor): void
    {
        $subcarpetas = [
            'Personal' => ['nivel_seguridad' => 'L1', 'nivel_acceso' => 'Bajo'],
            'Trabajo' => ['nivel_seguridad' => 'L1', 'nivel_acceso' => 'Bajo'],
            'Seguridad' => ['nivel_seguridad' => 'L3', 'nivel_acceso' => 'Alto']
        ];

        foreach ($subcarpetas as $nombreSubcarpeta => $configuracion) {
            $subcarpeta = $this->directoryService->createSubdirectory(
                $carpetaEmpleado,
                $nombreSubcarpeta,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad[$configuracion['nivel_seguridad']]->id,
                    'nivel_acceso_id' => $this->nivelesAcceso[$configuracion['nivel_acceso']]->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta de {$nombreSubcarpeta}",
                    'user_id' => $user->id
                ],
                $actor
            );

            // Si es la carpeta de Trabajo, crear subcarpetas específicas
            if ($nombreSubcarpeta === 'Trabajo') {
                $this->createWorkSubfolders($subcarpeta, $user, $actor);
            }
        }
    }

    /**
     * Crea las subcarpetas específicas de trabajo
     */
    protected function createWorkSubfolders(Folder $carpetaTrabajo, User $user, User $actor): void
    {
        $subcarpetasTrabajo = [
            'Nominas',
            'Certificados',
            'Permisos',
            'Justificantes y Bajas'
        ];

        foreach ($subcarpetasTrabajo as $nombreSubcarpeta) {
            $subcarpeta = $this->directoryService->createSubdirectory(
                $carpetaTrabajo,
                $nombreSubcarpeta,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Carpeta de {$nombreSubcarpeta}",
                    'user_id' => $user->id
                ],
                $actor
            );

            // Si es la carpeta de Nóminas, crear estructura de años
            if ($nombreSubcarpeta === 'Nominas') {
                $this->createPayrollYearStructure($subcarpeta, $user, $actor);
            }
        }
    }

    /**
     * Crea la estructura de años para las nóminas
     */
    protected function createPayrollYearStructure(Folder $carpetaNominas, User $user, User $actor): void
    {
        $anioActual = now()->year;
        $anios = [$anioActual - 1, $anioActual, $anioActual + 1]; // Año anterior, actual y siguiente

        foreach ($anios as $anio) {
            $carpetaAnio = $this->directoryService->createSubdirectory(
                $carpetaNominas,
                (string) $anio,
                [
                    'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                    'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                    'is_visible' => true,
                    'is_erasable' => true,
                    'description' => "Nóminas del año {$anio}",
                    'user_id' => $user->id
                ],
                $actor
            );

            // Solo para el año actual, crear carpetas de meses
            if ($anio === $anioActual) {
                $this->createMonthStructure($carpetaAnio, $user, $actor);
            }
        }
    }

    /**
     * Crea la estructura de meses para el año actual
     */
    protected function createMonthStructure(Folder $carpetaAnio, User $user, User $actor): void
    {
        $meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        $anioActual = now()->year;
        $mesActual = now()->month;

        foreach ($meses as $index => $mes) {
            $mesNumero = $index + 1;
            
            // Solo crear carpetas hasta el mes actual
            if ($mesNumero <= $mesActual) {
                $carpetaMes = $this->directoryService->createSubdirectory(
                    $carpetaAnio,
                    $mes,
                    [
                        'nivel_seguridad_id' => $this->nivelesSeguridad['L1']->id,
                        'nivel_acceso_id' => $this->nivelesAcceso['Bajo']->id,
                        'is_visible' => true,
                        'is_erasable' => true,
                        'description' => "Nóminas de {$mes} {$anioActual}",
                        'user_id' => $user->id
                    ],
                    $actor
                );
            }
        }
    }
} 