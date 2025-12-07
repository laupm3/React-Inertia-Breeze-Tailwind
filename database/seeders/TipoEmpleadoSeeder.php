<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TipoEmpleado;

class TipoEmpleadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TipoEmpleado::create(['nombre' => 'Empleado', 'descripcion' => 'Empleado de la empresa']);
        TipoEmpleado::create(['nombre' => 'Manager', 'descripcion' => 'Manager de la empresa']);
        TipoEmpleado::create(['nombre' => 'Directivo', 'descripcion' => 'Directivo de la empresa']);
    }
}
