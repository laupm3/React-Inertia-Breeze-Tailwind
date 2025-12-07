<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\TipoIncidencia;
use Database\Seeders\TipoIncidenciaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TipoIncidenciaSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ejecutar el seeder antes de cada test
        $this->seed(TipoIncidenciaSeeder::class);
    }

    /** @test */
    public function it_creates_employee_related_tipo_incidencias()
    {
        $this->assertDatabaseHas('tipo_incidencias', [
            'name' => 'Roles y Permisos',
            'code' => 'empleados_roles',
            'is_active' => true,
        ]);

        $rolesYPermisos = TipoIncidencia::where('code', 'empleados_roles')->first();
        $this->assertNotNull($rolesYPermisos);
    }

    /** @test */
    public function it_creates_contract_related_tipo_incidencias()
    {
        $this->assertDatabaseHas('tipo_incidencias', [
            'name' => 'Condiciones',
            'code' => 'contratos_condiciones',
            'is_active' => true,
        ]);

        $condiciones = TipoIncidencia::where('code', 'contratos_condiciones')->first();
        $this->assertNotNull($condiciones);
    }

    /** @test */
    public function it_creates_center_related_tipo_incidencias()
    {
        $this->assertDatabaseHas('tipo_incidencias', [
            'name' => 'Configuración',
            'code' => 'centros_configuracion',
        ]);

        $configuracion = TipoIncidencia::where('code', 'centros_configuracion')->first();
        $this->assertNotNull($configuracion);
    }

    /** @test */
    public function it_creates_user_related_tipo_incidencias()
    {
        $this->assertDatabaseHas('tipo_incidencias', [
            'name' => 'Acceso',
            'code' => 'usuarios_acceso',
        ]);

        $acceso = TipoIncidencia::where('code', 'usuarios_acceso')->first();
        $this->assertNotNull($acceso);
    }

    /** @test */
    public function it_maintains_correct_sort_order()
    {
        $tipoIncidencias = TipoIncidencia::where('code', 'like', 'empleados%')->orderBy('sort_order')->get();

        $this->assertNotEmpty($tipoIncidencias, 'No se encontraron tipos de incidencia con código que empiece por "empleados"');

        if ($tipoIncidencias->isNotEmpty()) {
            $this->assertEquals('Roles y Permisos', $tipoIncidencias->first()->name);
            $this->assertEquals('Permisos', $tipoIncidencias->last()->name);
            $this->assertEquals(1, $tipoIncidencias->first()->sort_order);
            $this->assertEquals(6, $tipoIncidencias->last()->sort_order);
        }
    }
}
