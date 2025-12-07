<?php

namespace Database\Seeders;

use App\Models\Asignacion;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AsignacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $asignaciones = json_decode(file_get_contents(database_path('data/asignaciones.json')));

        foreach ($asignaciones as $asignacion) {
            Asignacion::create([
                'nombre' => $asignacion->nombre,
                'descripcion' => $asignacion->descripcion,
            ]);
        }
    }
}
