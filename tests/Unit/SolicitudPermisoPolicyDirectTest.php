<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Empleado;
use App\Models\SolicitudPermiso;
use App\Models\Permiso;
use App\Models\PermisoCategoria;
use App\Models\TipoEmpleado;
use App\Models\TipoDocumento;
use App\Models\Direccion;
use App\Models\Genero;
use App\Models\EstadoSolicitudPermiso;
use App\Models\EstadoEmpleado;
use App\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Policies\SolicitudPermisoPolicy;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;

class SolicitudPermisoPolicyDirectTest extends TestCase
{
    use RefreshDatabase;

    protected SolicitudPermisoPolicy $policy;
    protected ApprovalService $approvalService;
    protected SolicitudPermisoStatusService $statusService;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear servicios
        $this->approvalService = app()->make(ApprovalService::class);
        $this->statusService = app()->make(SolicitudPermisoStatusService::class);

        // Crear política
        $this->policy = new SolicitudPermisoPolicy($this->approvalService, $this->statusService);

        // Configurar la base de datos para testing
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);

        // Crear estados de solicitud (PENDIENTE, EN_REVISION, etc.)
        $estado = EstadoSolicitudPermiso::firstOrCreate(['nombre' => 'PENDIENTE']);

        // Crear estado de empleado
        $estadoEmpleado = EstadoEmpleado::factory()->create([
            'nombre' => 'Activo',
            'descripcion' => 'Empleado en activo'
        ]);

        // Crear tipo de documento
        $tipoDocumento = TipoDocumento::factory()->create([
            'nombre' => 'DNI',
            'descripcion' => 'Documento Nacional de Identidad'
        ]);

        // Crear dirección
        $direccion = Direccion::factory()->create([
            'full_address' => 'Calle de Test, 123',
            'codigo_postal' => '28001'
        ]);

        // Crear tipo de empleado para los tests
        $tipoEmpleado = TipoEmpleado::factory()->create([
            'nombre' => 'Empleado Test',
            'descripcion' => 'Tipo de empleado para tests'
        ]);

        // Crear género para los empleados
        $genero = Genero::factory()->create([
            'nombre' => 'Género Test'
        ]);

        // Crear categoría de permisos para tests
        $categoriaPermiso = PermisoCategoria::factory()->create([
            'name' => 'Categoría Test',
            'description' => 'Categoría para tests'
        ]);

        // Crear un permiso (tipo de permiso) para las solicitudes
        $permiso = Permiso::firstOrCreate([
            'nombre' => 'Permiso Test',
            'categoria_id' => $categoriaPermiso->id,
            'nombre_oficial' => 'Permiso Test Oficial',
        ], [
            'descripcion' => 'Permiso para tests',
            'descripcion_oficial' => 'Descripción oficial para tests',
            'duracion' => 1,
            'retribuido' => true
        ]);

        // Crear módulo de prueba para permisos
        $module = Module::firstOrCreate([
            'name' => 'Test',
        ], [
            'description' => 'Módulo de test para permisos',
        ]);

        // Crear roles necesarios
        foreach ([
            'Super Admin', 'HR', 'Manager', 'Direction', 'Empleado'
        ] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Crear permisos necesarios
        foreach ([
            'canManageHrWorkPermitRequests',
            'canManageManagerWorkPermitRequests',
            'canManageDirectionWorkPermitRequests',
            'createSolicitudPermiso',
            'editSolicitudPermiso',
            'deleteSolicitudPermiso',
            'viewSolicitudPermiso',
        ] as $perm) {
            Permission::firstOrCreate([
                'name' => $perm,
                'title' => $perm,
                'guard_name' => 'web',
                'module_id' => $module->id,
            ]);
        }
    }

    /**
     * Test que el admin puede hacer cualquier cosa
     */
    public function test_admin_can_do_anything(): void
    {
        // Crear un empleado para el admin
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();
        $empleado = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear un empleado solicitante
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);
          // Crear usuario admin con todos los permisos necesarios
        $admin = User::factory()->create(['empleado_id' => $empleado->id]);
        $admin->assignRole('Super Admin');
        $admin->givePermissionTo('canManageHrWorkPermitRequests');
        $admin->givePermissionTo('canManageManagerWorkPermitRequests');
        $admin->givePermissionTo('canManageDirectionWorkPermitRequests');
        // Crear solicitud
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar que puede aprobar como HR
        $this->assertTrue($this->policy->approve($admin, $solicitud, 'hr'));

        // Comprobar que puede aprobar como Manager
        $this->assertTrue($this->policy->approve($admin, $solicitud, 'manager'));

        // Comprobar que puede aprobar como Direction
        $this->assertTrue($this->policy->approve($admin, $solicitud, 'direction'));
    }

    /**
     * Test que HR sólo puede aprobar como HR
     */
    public function test_hr_can_only_approve_as_hr(): void
    {
        // Crear un empleado para HR
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();
        $empleado = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear un empleado solicitante
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario HR
        $hr = User::factory()->create(['empleado_id' => $empleado->id]);
        $hr->assignRole('HR');
        $hr->givePermissionTo('canManageHrWorkPermitRequests');

        // Crear solicitud
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar que puede aprobar como HR
        $this->assertTrue($this->policy->approve($hr, $solicitud, 'hr'));

        // Comprobar que NO puede aprobar como Manager
        $this->assertFalse($this->policy->approve($hr, $solicitud, 'manager'));

        // Comprobar que NO puede aprobar como Direction
        $this->assertFalse($this->policy->approve($hr, $solicitud, 'direction'));
    }

    /**
     * Test que Manager sólo puede aprobar como Manager
     */
    public function test_manager_can_only_approve_as_manager(): void
    {
        // Crear un empleado para Manager
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();
        $empleado = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear un empleado solicitante
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Manager
        $manager = User::factory()->create(['empleado_id' => $empleado->id]);
        $manager->assignRole('Manager');
        $manager->givePermissionTo('canManageManagerWorkPermitRequests');

        // Crear solicitud
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar que NO puede aprobar como HR
        $this->assertFalse($this->policy->approve($manager, $solicitud, 'hr'));

        // Comprobar que puede aprobar como Manager
        $this->assertTrue($this->policy->approve($manager, $solicitud, 'manager'));

        // Comprobar que NO puede aprobar como Direction
        $this->assertFalse($this->policy->approve($manager, $solicitud, 'direction'));
    }

    /**
     * Test que Direction sólo puede aprobar como Direction
     */
    public function test_direction_can_only_approve_as_direction(): void
    {
        // Crear un empleado para Direction
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();
        $empleado = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear un empleado solicitante
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Direction
        $direction = User::factory()->create(['empleado_id' => $empleado->id]);
        $direction->assignRole('Direction');
        $direction->givePermissionTo('canManageDirectionWorkPermitRequests');

        // Crear solicitud
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar que NO puede aprobar como HR
        $this->assertFalse($this->policy->approve($direction, $solicitud, 'hr'));

        // Comprobar que NO puede aprobar como Manager
        $this->assertFalse($this->policy->approve($direction, $solicitud, 'manager'));

        // Comprobar que puede aprobar como Direction
        $this->assertTrue($this->policy->approve($direction, $solicitud, 'direction'));
    }

    /**
     * Test que Empleado no puede aprobar nada
     */
    public function test_employee_cannot_approve_anything(): void
    {
        // Crear un empleado para Empleado
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();
        $empleado = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear un empleado solicitante
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Empleado
        $employee = User::factory()->create(['empleado_id' => $empleado->id]);
        $employee->assignRole('Empleado');

        // Crear solicitud
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar que NO puede aprobar como HR
        $this->assertFalse($this->policy->approve($employee, $solicitud, 'hr'));

        // Comprobar que NO puede aprobar como Manager
        $this->assertFalse($this->policy->approve($employee, $solicitud, 'manager'));

        // Comprobar que NO puede aprobar como Direction
        $this->assertFalse($this->policy->approve($employee, $solicitud, 'direction'));
    }
}
