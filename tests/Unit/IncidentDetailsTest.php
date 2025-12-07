<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Incident;
use App\Models\IncidentDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Testing\RefreshDatabase;

class IncidentDetailsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutExceptionHandling();

        // Habilitar las restricciones de clave externa en SQLite
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = ON');

        // Desactivar transacciones para SQLite
        $this->beforeApplicationDestroyed(function () {
            $this->artisan('migrate:fresh');
        });
    }

    /**
     * Verifica que la tabla `incident_details` tenga las columnas esperadas.
     */
    public function test_incident_details_table_has_expected_columns()
    {
        $this->assertTrue(
            Schema::hasColumns('incident_details', [
                'id',
                'incident_id',
                'quantity',
                'notes',
                'relatedDetail_type',
                'relatedDetail_id',
                'created_at',
                'updated_at',
                'deleted_at',
            ]),
            'La tabla `incident_details` no tiene las columnas esperadas.'
        );
    }

    /**
     * Prueba la creación de un detalle de incidencia con una relación polimórfica.
     */
    public function test_can_create_incident_detail_with_polymorphic_relation()
    {
        $incident = Incident::factory()->create();

        $incidentDetail = IncidentDetail::create([
            'incident_id' => $incident->id,
            'quantity' => 10,
            'notes' => 'Detalle de prueba',
            'relatedDetail_type' => 'App\Models\Product',
            'relatedDetail_id' => 1,
        ]);

        $this->assertDatabaseHas('incident_details', [
            'incident_id' => $incident->id,
            'quantity' => 10,
            'notes' => 'Detalle de prueba',
            'relatedDetail_type' => 'App\Models\Product',
            'relatedDetail_id' => 1,
        ]);
    }

    /**
     * Prueba que los detalles de incidencia se eliminan cuando se elimina la incidencia.
     */
    public function test_incident_detail_is_deleted_when_incident_is_deleted()
    {
        // Crear una incidencia
        $incident = Incident::factory()->create();

        // Crear un detalle
        $detail = IncidentDetail::factory()->create([
            'incident_id' => $incident->id,
        ]);

        // Verificar que ambos existen
        $this->assertDatabaseHas('incidents', ['id' => $incident->id]);
        $this->assertDatabaseHas('incident_details', ['id' => $detail->id]);

        // Eliminar la incidencia
        $incident->delete();

        // Refrescar la caché del modelo
        $detail->refresh();

        // Verificar que el detalle también fue eliminado
        $this->assertTrue($detail->trashed(), 'El detalle de incidencia no fue eliminado');
    }
}
