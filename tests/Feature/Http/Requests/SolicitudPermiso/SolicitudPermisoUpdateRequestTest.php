<?php

namespace Tests\Feature\Http\Requests\SolicitudPermiso;

use Tests\TestCase;
use App\Models\User;
use App\Models\Permiso;
use App\Models\SolicitudPermiso;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoUpdateRequest;

class SolicitudPermisoUpdateRequestTest extends TestCase

{
    use DatabaseTransactions, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Configurar la ruta para el test
        Route::post('test-solicitud-update-request', function (SolicitudPermisoUpdateRequest $request) {
            return response()->json(['data' => 'passed']);
        });

        // Obtiene un permiso existente para la prueba
        $this->permiso = Permiso::take(1)->first();

        // Usuario con empleado
        $this->user = User::whereNotNull('empleado_id')->first();
        if ($this->user) {
            $this->empleado = $this->user->empleado;

            // Crear una solicitud para el empleado
            $this->solicitudPermiso = SolicitudPermiso::where('empleado_id', $this->empleado->id)->first();

            // Si no existe, creamos una solicitud para este empleado
            if (!$this->solicitudPermiso) {
                $this->solicitudPermiso = SolicitudPermiso::create([
                    'empleado_id' => $this->empleado->id,
                    'permiso_id' => $this->permiso->id,
                    'fecha_inicio' => now()->format('Y-m-d'),
                    'fecha_fin' => now()->format('Y-m-d'),
                    'dia_completo' => true,
                ]);
            }
        }

        // Usuario sin empleado
        $this->userWithoutEmployee = User::whereNull('empleado_id')->first();

        // Otro usuario con empleado (para pruebas de autorización)
        $this->otherUser = User::whereNotNull('empleado_id')
            ->where('id', '!=', $this->user ? $this->user->id : 0)
            ->first();
    }

    /**
     * Test de autorización: usuario sin empleado no puede pasar
     */
    public function test_authorization_fails_for_user_without_employee(): void
    {
        if (!$this->userWithoutEmployee || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios sin empleado o solicitudes de permiso en la base de datos.');
        }

        $this->actingAs($this->userWithoutEmployee)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->solicitudPermiso->empleado_id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
            ])
            ->assertForbidden();
    }

    /**
     * Test de autorización: un usuario no puede actualizar la solicitud de otro empleado
     */
    public function test_authorization_fails_for_mismatched_employee_id(): void
    {
        if (!$this->user || !$this->otherUser || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay suficientes usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        // Intentar actualizar con el empleado_id de otro usuario
        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->otherUser->empleado->id, // ID de otro empleado
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
            ])
            ->assertForbidden();
    }

    /**
     * Test que valida campos obligatorios
     */
    public function test_required_fields_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        $response = $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                // Sin enviar campos obligatorios excepto empleado_id
                'empleado_id' => $this->empleado->id, // Enviamos este para pasar la autorización
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'id',
                'permiso_id',
                'fecha_inicio',
                'fecha_fin',
                'dia_completo'
            ]);

        // Verificar que si falla el test muestre la respuesta
        $this->assertNotEmpty($response->json('errors'));
    }

    /**
     * Test para validar que hora_inicio y hora_fin son obligatorios cuando dia_completo es false
     */
    public function test_hours_required_when_not_full_day(): void
    {
        if (!$this->user || !$this->permiso || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado, permisos o solicitudes en la base de datos.');
        }

        // Caso 1: Sin proporcionar hora_inicio ni hora_fin
        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => false,
                // No se proporcionan ni hora_inicio ni hora_fin
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio', 'hora_fin']);

        // Caso 2: Proporcionar solo hora_inicio
        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => false,
                'hora_inicio' => '09:00',
                // No se proporciona hora_fin
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_fin'])
            ->assertJsonMissingValidationErrors(['hora_inicio']); // hora_inicio es válido

        // Caso 3: Proporcionar solo hora_fin
        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => false,
                'hora_fin' => '18:00',
                // No se proporciona hora_inicio
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio'])
            ->assertJsonMissingValidationErrors(['hora_fin']); // hora_fin es válido

        // Caso 4: Proporcionar ambas horas (caso válido)
        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => false,
                'hora_inicio' => '09:00',
                'hora_fin' => '18:00',
            ])
            ->assertStatus(200)
            ->assertJson(['data' => 'passed']);
    }
    
    /**
     * Test que valida el formato de fecha
     */
    public function test_date_format_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => '01-01-2023', // Formato incorrecto
                'fecha_fin' => '02-01-2023',    // Formato incorrecto
                'dia_completo' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'fecha_inicio',
                'fecha_fin'
            ]);
    }

    /**
     * Test que valida el formato de hora
     */
    public function test_time_format_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => false,
                'hora_inicio' => '9:00 AM', // Formato incorrecto
                'hora_fin' => '2:00 PM',    // Formato incorrecto
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'hora_inicio',
                'hora_fin'
            ]);
    }

    /**
     * Test de validación de permiso_id existente
     */
    public function test_permiso_id_exists_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => 99999999, // ID que no existe
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'permiso_id'
            ]);
    }
    
    /**
     * Test de validación de id de solicitud existente
     */
    public function test_solicitud_id_exists_validation(): void
    {
        if (!$this->user) {
            $this->markTestSkipped('No hay usuarios con empleado en la base de datos.');
        }

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => 99999999, // ID que no existe
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'id'
            ]);
    }

    /**
     * Test de datos válidos pasan la validación
     */
    public function test_valid_data_passes_validation(): void
    {
        if (!$this->user || !$this->permiso || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado, permisos o solicitudes en la base de datos.');
        }

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'motivo' => 'Motivo de prueba actualizado',
                'recuperable' => true,
                'dia_completo' => true,
            ])
            ->assertStatus(200)
            ->assertJson([
                'data' => 'passed'
            ]);
    }

    /**
     * Test de validación de tipos de archivo
     */
    public function test_file_type_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        // Crear un archivo JS falso (no permitido)
        $file = UploadedFile::fake()->create('test.js', 100, 'application/javascript');

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
                'files' => [$file]
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'files.0'
            ]);
    }

    /**
     * Test con un archivo permitido
     */
    public function test_valid_file_passes_validation(): void
    {
        if (!$this->user || !$this->solicitudPermiso) {
            $this->markTestSkipped('No hay usuarios con empleado o solicitudes de permiso en la base de datos.');
        }

        // Crear un archivo PDF falso (permitido)
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $this->actingAs($this->user)
            ->postJson('test-solicitud-update-request', [
                'id' => $this->solicitudPermiso->id,
                'empleado_id' => $this->empleado->id,
                'permiso_id' => $this->permiso->id,
                'fecha_inicio' => now()->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'dia_completo' => true,
                'files' => [$file]
            ])
            ->assertStatus(200);
    }
}
