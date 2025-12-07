<?php

namespace Database\Seeders;

use App\Models\Empleado;
use Illuminate\Support\Arr;
use App\Models\Departamento;
use App\Models\TipoEmpleado;
use Illuminate\Database\Seeder;

class DepartamentoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departamentos = json_decode(file_get_contents(database_path('data/departamentos.json')));

        $tipo_empleados = TipoEmpleado::all();

        // Get the director and manager type employees
        $manager_id = $tipo_empleados->where('nombre', 'Manager')->first()->id;

        // Obtiene un único responsable aleatorio que sea director o Manager
        $managers = Empleado::where('tipo_empleado_id', $manager_id)->get();

        foreach ($departamentos as $departamento) {

            $manager = $managers->random()->id;
            $adjunto = $managers->filter(function ($adjunto) use ($manager) {
                return $adjunto->id !== $manager;
            })->random()->id;

            Departamento::create([
                'nombre' => $departamento->nombre,
                'descripcion' => $departamento->descripcion,
                'manager_id' => $manager,
                'adjunto_id' => $adjunto,
                'parent_department_id' => null,
            ]);
        }

        // Get all the departments and associate them with a parent department
        $departamentos = Departamento::all();

        foreach ($departamentos as $departamento) {
            $departamento->parent_department_id = $departamentos->random()->id;

            if (Arr::random([true, false, false])) {
                $departamento->parent_department_id = $departamentos->random()->id;
                $departamento->save();
            }
        }
    }
}
