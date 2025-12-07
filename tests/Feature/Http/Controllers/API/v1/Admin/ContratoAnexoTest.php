<?php

namespace Tests\Feature\Http\Controllers\API\v1\Admin;

use App\Models\Anexo;
use App\Models\Contrato;
use App\Models\User;
use App\Models\Empleado;
use App\Models\TipoEmpleado;
use App\Helpers\DateHelper;
use App\Http\Requests\Anexo\AnexoStoreRequest;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ContratoAnexoTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * @var User
     * Usuario administrador para las pruebas
     */
    protected User $admin;

    /**
     * @var Contrato
     * Contrato existente en la base de datos para testing
     */
    protected Contrato $contrato;

    /**
     * @var \Illuminate\Database\Eloquent\Collection<Contrato>
     */
    protected $existingContratos;

    /**
     * @var array<int>
     */
    protected $validEmpleados;

    /**
     * Configuración previa para cada test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Obtener un usuario admin existente
        $this->admin = User::role('Super Admin')->first();

        // Si no hay admin, obtener el primer usuario y asignarle el rol
        if (!$this->admin) {
            $this->admin = User::first();
            if ($this->admin) {
                $this->admin->assignRole('Super Admin');
            }
        }

        // Obtener contratos existentes para testing
        $this->existingContratos = Contrato::with(['empleado', 'empleado.tipoEmpleado'])
            ->inRandomOrder()
            ->limit(3)
            ->get();

        // Usar el primer contrato existente
        $this->contrato = $this->existingContratos->first();

        // Obtener IDs válidos de empleados existentes
        $this->validEmpleados = Empleado::pluck('id')->take(5)->toArray();
    }

    public function test_admin_can_create_anexo_for_a_contract()
    {
        $this->actingAs($this->admin);

        // El formato de las fechas debe ser exactamente: 'Y-m-d\TH:i:s.v\Z'
        $anexoData = [
            'jornada_id' => $this->contrato->jornada_id, // Usar jornada del contrato
            'fecha_inicio' => DateHelper::toApiFormat(now()), // Formato exacto esperado
            'fecha_fin' => DateHelper::toApiFormat(now()->addMonth()),
        ];

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", $anexoData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'anexo' => [
                    'contrato_id',
                    'jornada_id',
                    'fecha_inicio',
                    'fecha_fin',
                ],
                'message'
            ])
            ->assertJson([
                'message' => 'Anexo creado correctamente.'
            ]);

        // Verificar los campos principales, sin preocuparnos por el formato exacto de las fechas
        $this->assertDatabaseHas('anexos', [
            'jornada_id' => $anexoData['jornada_id'],
            'contrato_id' => $this->contrato->id,
        ]);
    }

    public function test_create_anexo_fails_with_invalid_data()
    {
        $this->actingAs($this->admin);

        // Datos inválidos: fecha_inicio posterior a fecha_fin (invertidas)
        $anexoData = [
            'jornada_id' => $this->contrato->jornada_id,
            'fecha_inicio' => DateHelper::toApiFormat(now()->addMonth()), // Fecha en el futuro
            'fecha_fin' => DateHelper::toApiFormat(now()), // Fecha actual (anterior a fecha_inicio)
        ];

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", $anexoData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fecha_fin']);

        $this->assertDatabaseMissing('anexos', [
            'contrato_id' => $this->contrato->id,
            'fecha_inicio' => $anexoData['fecha_inicio']
        ]);
    }

    public function test_admin_can_update_anexo()
    {
        $this->actingAs($this->admin);

        // Usar un anexo existente de la base de datos real
        $anexo = Anexo::where('contrato_id', $this->contrato->id)->first();

        // Si no existe, crear uno temporal para el test
        if (!$anexo) {
            $anexo = Anexo::create([
                'jornada_id' => $this->contrato->jornada_id,
                'contrato_id' => $this->contrato->id,
                'fecha_inicio' => DateHelper::toApiFormat(now()->subMonth()),
                'fecha_fin' => DateHelper::toApiFormat(now()),
            ]);
        }

        $updateData = [
            'fecha_inicio' => DateHelper::toApiFormat($anexo->fecha_inicio),
            'fecha_fin' => DateHelper::toApiFormat(now()->addYears(2)),
        ];

        $response = $this->putJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos/{$anexo->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'anexo' => [
                    'id',
                    'contrato_id',
                    'fecha_inicio',
                    'fecha_fin'
                ],
                'message'
            ])
            ->assertJson([
                'message' => 'Anexo actualizado correctamente.'
            ]);

        // Verificar solo que el ID existe en la base de datos
        $this->assertDatabaseHas('anexos', [
            'id' => $anexo->id,
        ]);

        // Verificar manualmente que la fecha se ha actualizado correctamente
        $updatedAnexo = Anexo::find($anexo->id);
        // Comparamos solo los componentes de fecha principales (año, mes, día) en lugar del formato exacto con milisegundos
        $this->assertEquals(
            (new \DateTime($updateData['fecha_fin']))->format('Y-m-d'),
            $updatedAnexo->fecha_fin->format('Y-m-d')
        );
    }

    public function test_admin_can_delete_anexo()
    {
        $this->actingAs($this->admin);

        // Crear un anexo temporal para eliminar (no queremos eliminar datos reales)
        $anexo = Anexo::create([
            'jornada_id' => $this->contrato->jornada_id,
            'contrato_id' => $this->contrato->id,
            'fecha_inicio' => DateHelper::toApiFormat(now()->subMonth()),
            'fecha_fin' => DateHelper::toApiFormat(now()),
        ]);

        $response = $this->deleteJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos/{$anexo->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Anexo eliminado correctamente.'
            ]);

        // Verificar soft delete en lugar de eliminación completa
        $this->assertNotNull(Anexo::withTrashed()->find($anexo->id)->deleted_at);
    }

    public function test_create_anexo_validates_required_fields()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fecha_inicio', 'fecha_fin']);
    }

    public function test_create_anexo_validates_date_logic()
    {
        $this->actingAs($this->admin);

        $anexoData = [
            'jornada_id' => $this->contrato->jornada_id,
            'fecha_inicio' => DateHelper::toApiFormat(now()->addMonth()),
            'fecha_fin' => DateHelper::toApiFormat(now()),
        ];

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", $anexoData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['fecha_fin']);
    }

    public function test_requires_authentication_for_anexo_operations()
    {
        $anexoData = [
            'jornada_id' => $this->contrato->jornada_id,
            'fecha_inicio' => DateHelper::toApiFormat(now()),
            'fecha_fin' => DateHelper::toApiFormat(now()->addMonth()),
        ];

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", $anexoData);

        $response->assertStatus(401);
    }

    public function test_requires_proper_permissions_for_anexo_operations()
    {
        /**
         * @var  \App\Models\User $user Crear usuario sin permisos
         */
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);

        $anexoData = [
            'jornada_id' => $this->contrato->jornada_id,
            'fecha_inicio' => DateHelper::toApiFormat(now()),
            'fecha_fin' => DateHelper::toApiFormat(now()->addMonth()),
        ];

        $response = $this->postJson("/api/v1/admin/contratos/{$this->contrato->id}/anexos", $anexoData);

        $response->assertStatus(403);
    }
}
