<?php

namespace Tests\Feature\Http\Controllers\API\v1\User;

use Tests\TestCase;
use App\Models\User;
use App\Models\Permiso;
use Illuminate\Support\Facades\Config;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;

class SolicitudPermisoControllerTest extends TestCase
{
    use DatabaseTransactions, WithFaker;
    /**
     * Configuración previa para cada test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Obtiene un permiso existente para la prueba
        $this->permiso = Permiso::take(1)->first();

        // Usuario con empleado
        $this->user = User::whereNotNull('empleado_id')->first();
        if ($this->user) {
            $this->empleado = $this->user->empleado;
        }
    }

    /**
     * Test: Crear solicitud de permiso exitosamente con día completo
     */
    public function test_can_create_solicitud_with_full_day(): void
    {
        // Buscar un usuario con empleado asociado
        $userWithEmployee = User::whereNotNull('empleado_id')->first();

        if (!$userWithEmployee) {
            $this->markTestSkipped('No hay usuarios con empleado asociado en la base de datos.');
        }

        // Datos para la solicitud
        $solicitudData = [
            'permiso_id' => $this->permiso->id,
            'fecha_inicio' => now()->format('Y-m-d'),
            'fecha_fin' => now()->addDays(1)->format('Y-m-d'),
            'motivo' => 'Motivo de prueba',
            'recuperable' => true,
            'dia_completo' => true,
        ];

        // Enviar solicitud
        $response = $this->actingAs($userWithEmployee)
            ->postJson('/api/v1/user/solicitudes', $solicitudData)
            ->assertCreated()
            ->assertJsonStructure([
                'success',
                'solicitud',
                'message',
            ]);
    }
}
