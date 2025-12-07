<?php

namespace Database\Seeders;

use App\Models\Centro;
use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\Direccion;
use App\Models\EstadoCentro;
use App\Models\TipoEmpleado;
use Illuminate\Database\Seeder;

class CentroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $centros = json_decode(file_get_contents(database_path('data/centros.json')));

        $estados_centro = EstadoCentro::all();

        $tipo_empleados = TipoEmpleado::all();

        // Get the director and manager type employees
        $tipos_empleados_id = $tipo_empleados->whereIn('nombre', ['Director', 'Manager'])->pluck(['id']);

        // Obtiene un único responsable aleatorio que sea director o Manager
        $responsables = Empleado::whereIn('tipo_empleado_id', $tipos_empleados_id)->get();

        $coordinadores = Empleado::whereIn('tipo_empleado_id', $tipos_empleados_id)->get();

        $empresas = Empresa::all();

        foreach ($centros as $centro) {

            // Obtiene un responsable aleatorio de la colección de representantes
            $responsable = $responsables->random();

            // Obtiene un coordinador aleatorio de la colección de adjuntos que no sea el responsable
            $coordinador = $coordinadores->filter(function ($coordinador) use ($responsable) {
                return $coordinador->id !== $responsable->id;
            })->random();

            $empresa = $empresas->random();

            Centro::factory()->create([
                'empresa_id' => $empresa->id,
                'responsable_id' => $responsable->id,
                'coordinador_id' => $coordinador->id,
                'estado_id' => $estados_centro->random()->id,
                'direccion_id' => Direccion::factory()->create()->id,
                'nombre' => $centro->nombre,
                'email' => ($centro->email) ? $centro->email : $centro->nombre . '@' . $empresa->nombre . '.com',
                'telefono' => $centro->telefono,
            ]);
        }
    }
}
