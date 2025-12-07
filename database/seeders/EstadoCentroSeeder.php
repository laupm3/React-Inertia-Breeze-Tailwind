<?php

namespace Database\Seeders;

use App\Models\EstadoCentro;
use Illuminate\Database\Seeder;

class EstadoCentroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EstadoCentro::create([
            'nombre' => 'Activo',
            'descripcion' => 'Centro activo',
        ]);
        EstadoCentro::create([
            'nombre' => 'Cerrado temporalmente',
            'descripcion' => 'Centro cerrado temporalmente',
        ]);

        EstadoCentro::create([
            'nombre' => 'Cerrado permanentemente',
            'descripcion' => 'Centro cerrado permanentemente',
        ]);
    }
}
