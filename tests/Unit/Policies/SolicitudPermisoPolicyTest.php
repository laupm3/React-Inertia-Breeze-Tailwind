<?php

namespace Tests\Unit\Policies;

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
use PHPUnit\Framework\Attributes\Test;

class SolicitudPermisoPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

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

    #[Test]
    public function admin_can_do_anything()
    {
        // Crear empleado con su tipo, género, estado, tipo de documento y dirección
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

        // Crear un empleado solicitante diferente (para evitar auto-aprobación)
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario admin asociado al empleado y darle todos los permisos necesarios
        $admin = User::factory()->create(['empleado_id' => $empleado->id]);
        $admin->assignRole('Super Admin');
        $admin->givePermissionTo('canManageHrWorkPermitRequests');
        $admin->givePermissionTo('canManageManagerWorkPermitRequests');
        $admin->givePermissionTo('canManageDirectionWorkPermitRequests');

        // Crear solicitud de permiso del otro empleado
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        // Comprobar permisos de visualización, creación, actualización y eliminación
        $this->assertTrue($admin->can('viewAny', SolicitudPermiso::class));
        $this->assertTrue($admin->can('view', $solicitud));
        $this->assertTrue($admin->can('create', SolicitudPermiso::class));
        $this->assertTrue($admin->can('update', $solicitud));
        $this->assertTrue($admin->can('delete', $solicitud));

        // Comprobar permisos de aprobación como diferentes roles
        $this->assertTrue($admin->can('approve', [$solicitud, 'hr']));
        $this->assertTrue($admin->can('approve', [$solicitud, 'manager']));
        $this->assertTrue($admin->can('approve', [$solicitud, 'direction']));
    }

    #[Test]
    public function hr_can_only_approve_as_hr()
    {
        // Crear empleado con su tipo, género, estado, tipo de documento y dirección
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

        // Crear un empleado solicitante diferente (para evitar auto-aprobación)
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario HR asociado al empleado
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('HR');
        $user->givePermissionTo('canManageHrWorkPermitRequests');

        // Crear solicitud de permiso de otro empleado
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        $this->assertTrue($user->can('approve', [$solicitud, 'hr']));
        $this->assertFalse($user->can('approve', [$solicitud, 'manager']));
        $this->assertFalse($user->can('approve', [$solicitud, 'direction']));
    }

    #[Test]
    public function manager_can_only_approve_as_manager()
    {
        // Crear empleado con su tipo, género, estado, tipo de documento y dirección
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

        // Crear un empleado solicitante diferente (para evitar auto-aprobación)
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Manager asociado al empleado
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Manager');
        $user->givePermissionTo('canManageManagerWorkPermitRequests');

        // Crear solicitud de permiso de otro empleado
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        $this->assertTrue($user->can('approve', [$solicitud, 'manager']));
        $this->assertFalse($user->can('approve', [$solicitud, 'hr']));
        $this->assertFalse($user->can('approve', [$solicitud, 'direction']));    }

    #[Test]
    public function direction_can_only_approve_as_direction()
    {
        // Crear empleado con su tipo, género, estado, tipo de documento y dirección
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

        // Crear un empleado solicitante diferente (para evitar auto-aprobación)
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Direction asociado al empleado
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Direction');
        $user->givePermissionTo('canManageDirectionWorkPermitRequests');

        // Crear solicitud de permiso de otro empleado
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        $this->assertTrue($user->can('approve', [$solicitud, 'direction']));
        $this->assertFalse($user->can('approve', [$solicitud, 'hr']));
        $this->assertFalse($user->can('approve', [$solicitud, 'manager']));
    }

    #[Test]
    public function employee_cannot_approve_anything()
    {
        // Crear empleado con su tipo, género, estado, tipo de documento y dirección
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

        // Crear un empleado solicitante diferente (para evitar auto-aprobación)
        $empleadoSolicitante = Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);

        // Crear usuario Empleado asociado al empleado
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Empleado');

        // Crear solicitud de permiso de otro empleado
        $solicitud = SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoSolicitante->id,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);

        $this->assertFalse($user->can('approve', [$solicitud, 'manager']));
        $this->assertFalse($user->can('approve', [$solicitud, 'hr']));
        $this->assertFalse($user->can('approve', [$solicitud, 'direction']));
    }
}
