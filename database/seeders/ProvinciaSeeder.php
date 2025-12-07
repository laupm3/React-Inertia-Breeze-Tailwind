<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Provincia;
use App\Models\Comunidad;

class ProvinciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $provincias = json_decode(file_get_contents(database_path('data/provincias.json')));

        foreach ($provincias as $provincia) {
            Provincia::create([
                'id' => $provincia->id,
                'nombre' => $provincia->nombre,
                'comunidad_id' => $provincia->comunidad_id
            ]);
        }
    }
}
