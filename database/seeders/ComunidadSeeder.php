<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Comunidad;
use App\Models\Pais;

class ComunidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pais = Pais::where('nombre', 'España')->first(); // Asumiendo que ya hay un país en la base de datos

        $comunidades = json_decode(file_get_contents(database_path('data/comunidades.json')));

        foreach ($comunidades as $comunidad) {
            Comunidad::create([
                'id' => $comunidad->id,
                'pais_id' => $pais->id,
                'nombre' => $comunidad->nombre,
            ]);
        }
    }
}
