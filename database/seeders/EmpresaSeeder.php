<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\Direccion;
use App\Models\TipoEmpleado;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empresas = json_decode(file_get_contents(database_path('data/empresas.json')));

        $tipo_empleados = TipoEmpleado::all();

        $directivo = $tipo_empleados->where('nombre', 'Directivo')->first();

        foreach ($empresas as $empresa) {

            // Get a random employee for the representative and the adjunto where the employee is not the same and is a director
            $representante = Empleado::where('tipo_empleado_id', $directivo->id)->inRandomOrder()->first();

            $adjunto = Empleado::where('tipo_empleado_id', $directivo->id)->where('id', '!=', $representante->id)->inRandomOrder()->first();

            Empresa::factory()->create([
                'representante_id' => $representante->id,
                'adjunto_id' => $adjunto->id,
                'direccion_id' => Direccion::factory()->create()->id,
                'nombre' => $empresa->nombre,
                'siglas' => $empresa->siglas,
                'cif' => $empresa->cif,
            ]);
        }
    }
}
