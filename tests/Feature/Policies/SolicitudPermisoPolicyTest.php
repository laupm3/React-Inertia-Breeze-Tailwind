<?php

namespace Tests\Feature\Policies;

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
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SolicitudPermisoPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

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
     * @test
     */
    public function admin_can_approve_any_solicitud()
    {
        $this->withoutExceptionHandling();
        $empleado = $this->createEmpleado();
        $empleadoSolicitante = $this->createEmpleado();
        $admin = User::factory()->create(['empleado_id' => $empleado->id]);
        $admin->assignRole('Super Admin');
        $admin->givePermissionTo('canManageHrWorkPermitRequests');
        $admin->givePermissionTo('canManageManagerWorkPermitRequests');
        $admin->givePermissionTo('canManageDirectionWorkPermitRequests');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $admin = $admin->fresh();
        $solicitud = $this->createSolicitudPermiso($empleadoSolicitante->id);
        $this->actingAs($admin);
        auth()->user()->load('roles', 'permissions');
        $response = $this->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
            'tipo_aprobacion' => 'hr',
            'aprobado' => true,
            'observacion' => 'Aprobado por admin'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'hr',
            'aprobado' => 1,
            'observacion' => 'Aprobado por admin'
        ]);

        // Probar que también puede aprobar como manager
        $response = $this->actingAs($admin)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'manager',
                             'aprobado' => true,
                             'observacion' => 'Aprobado por admin como manager'
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'manager',
            'aprobado' => 1
        ]);

        // Probar que también puede aprobar como dirección
        $response = $this->actingAs($admin)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'direction',
                             'aprobado' => true,
                             'observacion' => 'Aprobado por admin como dirección'
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'direction',
            'aprobado' => 1
        ]);
    }

    /**
     * @test
     */
    public function hr_can_only_approve_as_hr()
    {
        $this->withoutExceptionHandling();
        $empleado = $this->createEmpleado();
        $empleadoSolicitante = $this->createEmpleado();
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('HR');
        $user->givePermissionTo('canManageHrWorkPermitRequests');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $user = $user->fresh();
        $solicitud = $this->createSolicitudPermiso($empleadoSolicitante->id);
        $this->actingAs($user);
        auth()->user()->load('roles', 'permissions');
        $response = $this->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
            'tipo_aprobacion' => 'hr',
            'aprobado' => true,
            'observacion' => 'Aprobado por RH'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'hr',
            'aprobado' => 1
        ]);

        // Intentar aprobar como manager (no debería poder)
        $response = $this->actingAs($user)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'manager',
                             'aprobado' => true,
                             'observacion' => 'Aprobado por RH como manager'
                         ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'manager',
            'aprobado' => 1
        ]);
    }

    /**
     * @test
     */
    public function manager_can_only_approve_as_manager()
    {
        $this->withoutExceptionHandling();
        $empleado = $this->createEmpleado();
        $empleadoSolicitante = $this->createEmpleado();
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Manager');
        $user->givePermissionTo('canManageManagerWorkPermitRequests');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $user = $user->fresh();
        $solicitud = $this->createSolicitudPermiso($empleadoSolicitante->id);
        $this->actingAs($user);
        auth()->user()->load('roles', 'permissions');
        $response = $this->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
            'tipo_aprobacion' => 'manager',
            'aprobado' => true,
            'observacion' => 'Aprobado por Manager'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'manager',
            'aprobado' => 1
        ]);

        // Intentar aprobar como HR (no debería poder)
        $response = $this->actingAs($user)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'hr',
                             'aprobado' => true,
                             'observacion' => 'Aprobado por Manager como HR'
                         ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'hr',
            'aprobado' => 1,
            'observacion' => 'Aprobado por Manager como HR'
        ]);
    }

    /**
     * @test
     */
    public function direction_can_only_approve_as_direction()
    {
        $this->withoutExceptionHandling();
        $empleado = $this->createEmpleado();
        $empleadoSolicitante = $this->createEmpleado();
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Direction');
        $user->givePermissionTo('canManageDirectionWorkPermitRequests');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $user = $user->fresh();
        $solicitud = $this->createSolicitudPermiso($empleadoSolicitante->id);
        $this->actingAs($user);
        auth()->user()->load('roles', 'permissions');
        $response = $this->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
            'tipo_aprobacion' => 'direction',
            'aprobado' => true,
            'observacion' => 'Aprobado por Dirección'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'direction',
            'aprobado' => 1
        ]);

        // Intentar aprobar como manager (no debería poder)
        $response = $this->actingAs($user)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'manager',
                             'aprobado' => true,
                             'observacion' => 'Aprobado por Dirección como manager'
                         ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'manager',
            'aprobado' => 1,
            'observacion' => 'Aprobado por Dirección como manager'
        ]);
    }

    /**
     * @test
     */
    public function employee_cannot_approve_anything()
    {
        $this->withoutExceptionHandling();
        $empleado = $this->createEmpleado();
        $empleadoSolicitante = $this->createEmpleado();
        $user = User::factory()->create(['empleado_id' => $empleado->id]);
        $user->assignRole('Empleado');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $user = $user->fresh();
        $solicitud = $this->createSolicitudPermiso($empleadoSolicitante->id);
        $this->actingAs($user);
        auth()->user()->load('roles', 'permissions');
        $response = $this->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
            'tipo_aprobacion' => 'hr',
            'aprobado' => true,
            'observacion' => 'Aprobado por empleado'
        ]);
        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'hr',
            'aprobado' => 1
        ]);

        // Intentar aprobar como manager (no debería poder)
        $response = $this->actingAs($user)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'manager',
                             'aprobado' => true
                         ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'manager',
            'aprobado' => 1
        ]);

        // Intentar aprobar como direction (no debería poder)
        $response = $this->actingAs($user)
                         ->postJson("/api/v1/admin/solicitud-permisos/{$solicitud->id}/process-approval", [
                             'tipo_aprobacion' => 'direction',
                             'aprobado' => true
                         ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('aprobacion_solicitud_permisos', [
            'solicitud_permiso_id' => $solicitud->id,
            'tipo_aprobacion' => 'direction',
            'aprobado' => 1
        ]);
    }

    /**
     * Método auxiliar para crear un empleado con todas sus relaciones
     */
    private function createEmpleado()
    {
        $tipoEmpleado = TipoEmpleado::first();
        $genero = Genero::first();
        $estadoEmpleado = EstadoEmpleado::first();
        $tipoDocumento = TipoDocumento::first();
        $direccion = Direccion::first();

        return Empleado::factory()->create([
            'tipo_empleado_id' => $tipoEmpleado->id,
            'genero_id' => $genero->id,
            'estado_id' => $estadoEmpleado->id,
            'tipo_documento_id' => $tipoDocumento->id,
            'direccion_id' => $direccion->id
        ]);
    }

    /**
     * Método auxiliar para crear una solicitud de permiso
     */
    private function createSolicitudPermiso($empleadoId)
    {
        return SolicitudPermiso::factory()->create([
            'empleado_id' => $empleadoId,
            'permiso_id' => Permiso::first()->id,
            'estado_id' => EstadoSolicitudPermiso::where('nombre', 'PENDIENTE')->first()->id,
            'fecha_inicio' => now()->addDay(),
            'fecha_fin' => now()->addDays(2)
        ]);
    }
}
