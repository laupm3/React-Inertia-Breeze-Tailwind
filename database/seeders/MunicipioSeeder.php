<?php

namespace Database\Seeders;

use App\Models\Municipio;
use Illuminate\Database\Seeder;

class MunicipioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $arbol = json_decode(file_get_contents(database_path('data/municipios-simplified.json')));
        // $arbol = json_decode(file_get_contents(database_path('data/municipios.json')));

        foreach ($arbol as $comunidad) {
            foreach ($comunidad->provincias as $provincia) {
                foreach ($provincia->municipios as $municipio) {
                    Municipio::create([
                        'nombre' => $municipio->nombre,
                        'provincia_id' => $provincia->id
                    ]);
                }
            }
        }
    }
}
