<?php

namespace Tests\Unit\Services\Storage;

use Tests\TestCase;
use App\Services\Storage\StoragePathService;
use App\Models\SolicitudPermiso;
use App\Models\Empleado;
use App\Models\Permiso;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StoragePathServiceTest extends TestCase
{
    use RefreshDatabase;

    private StoragePathService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new StoragePathService();
    }

    /** @test */
    public function genera_ruta_correcta_para_solicitud_permiso()
    {
        // Arrange
        $empleado = Empleado::factory()->create(['nif' => '12345678A']);
        $permiso = Permiso::factory()->create(['nombre' => 'Permiso de Paternidad']);
        $solicitudPermiso = SolicitudPermiso::factory()->create([
            'id' => 123,
            'empleado_id' => $empleado->id,
            'permiso_id' => $permiso->id
        ]);

        // Act
        $ruta = $this->service->getSolicitudPermisoStoragePath($solicitudPermiso);

        // Assert
        $expected = 'hr/Empleados/12345678A/Trabajo/Permisos/Permiso_de_Paternidad/123';
        $this->assertEquals($expected, $ruta);
    }

    /** @test */
    public function sanitiza_caracteres_especiales_en_nombres()
    {
        // Arrange
        $empleado = Empleado::factory()->create(['nif' => '12345678-B']);
        $permiso = Permiso::factory()->create(['nombre' => 'Permiso / Licencia (Especial)']);
        $solicitudPermiso = SolicitudPermiso::factory()->create([
            'id' => 456,
            'empleado_id' => $empleado->id,
            'permiso_id' => $permiso->id
        ]);

        // Act
        $ruta = $this->service->getSolicitudPermisoStoragePath($solicitudPermiso);

        // Assert
        $expected = 'hr/Empleados/12345678-B/Trabajo/Permisos/Permiso_Licencia_Especial/456';
        $this->assertEquals($expected, $ruta);
    }

    /** @test */
    public function genera_ruta_base_empleado()
    {
        // Arrange
        $empleado = Empleado::factory()->create(['nif' => '87654321Z']);

        // Act
        $ruta = $this->service->getEmpleadoBasePath($empleado);

        // Assert
        $expected = 'hr/Empleados/87654321Z';
        $this->assertEquals($expected, $ruta);
    }

    /** @test */
    public function genera_ruta_documentos_empleado()
    {
        // Arrange
        $empleado = Empleado::factory()->create(['nif' => '11111111H']);

        // Act
        $ruta = $this->service->getEmpleadoDocumentPath($empleado, 'Contratos');

        // Assert
        $expected = 'hr/Empleados/11111111H/Trabajo/Contratos';
        $this->assertEquals($expected, $ruta);
    }

    /** @test */
    public function maneja_subcategorias_con_caracteres_especiales()
    {
        // Arrange
        $empleado = Empleado::factory()->create(['nif' => '22222222J']);

        // Act
        $ruta = $this->service->getEmpleadoDocumentPath($empleado, 'Nóminas & Liquidaciones');

        // Assert
        $expected = 'hr/Empleados/22222222J/Trabajo/Nominas_Liquidaciones';
        $this->assertEquals($expected, $ruta);
    }
}
