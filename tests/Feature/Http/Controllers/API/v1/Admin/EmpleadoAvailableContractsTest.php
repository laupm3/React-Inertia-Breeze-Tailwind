<?php

namespace Tests\Feature\Http\Controllers\API\v1\Admin;

use App\Models\User;
use App\Models\Empleado;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EmpleadoAvailableContractsTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::role('Super Admin')->first();

        if (!$this->admin) {
            $this->markTestSkipped('Usuario admin no encontrado');
        }
    }

    #[Test]
    public function it_validates_empleados_existence_with_single_query()
    {
        $this->actingAs($this->admin);

        // Test con empleados que no existen
        $response = $this->postJson('/api/v1/admin/empleados/available-contracts', [
            'empleados' => [
                [
                    'empleado_id' => 99999, // No existe
                    'fechas' => ['2025-06-20']
                ],
                [
                    'empleado_id' => 99998, // No existe
                    'fechas' => ['2025-06-21']
                ]
            ]
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'empleados.0.empleado_id',
                'empleados.1.empleado_id'
            ]);
    }

    #[Test]
    public function it_requires_authentication()
    {
        $response = $this->postJson('/api/v1/admin/empleados/available-contracts', [
            'empleados' => [
                [
                    'empleado_id' => 1,
                    'fechas' => ['2025-06-20']
                ]
            ]
        ]);

        $response->assertStatus(401);
    }

    #[Test]
    public function it_successfully_queries_available_contracts()
    {
        $this->actingAs($this->admin);

        $empleado = Empleado::first();

        if (!$empleado) {
            $this->markTestSkipped('No hay empleados disponibles');
        }

        $response = $this->postJson('/api/v1/admin/empleados/available-contracts', [
            'empleados' => [
                [
                    'empleado_id' => $empleado->id,
                    'fechas' => [now()->addDays(1)->format('Y-m-d')]
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'disponibilidad',
                'total_empleados',
                'total_fechas_unicas',
                'message'
            ]);
    }
}
