<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EstadoEmpleado;

class EstadoEmpleadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EstadoEmpleado::create(['nombre' => 'Activo', 'descripcion' => 'Empleado activo']);
        EstadoEmpleado::create(['nombre' => 'Inactivo', 'descripcion' => 'Empleado inactivo']);
        EstadoEmpleado::create(['nombre' => 'Enfermedad', 'descripcion' => 'Empleado de baja por enfermedad']);
        EstadoEmpleado::create(['nombre' => 'Cese', 'descripcion' => 'Empleado cesado']);
    }
}
