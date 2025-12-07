<?php

namespace Database\Seeders;

use App\Models\TipoFichero;
use Illuminate\Database\Seeder;

class TipoFicheroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TipoFichero::create([
            'nombre' => 'Carpeta',
            'descripcion' => 'Carpeta de ficheros.',
        ]);

        TipoFichero::create([
            'nombre' => 'Archivo',
            'descripcion' => 'Archivo, puede ser de cualquier tipo.',
        ]);
    }
}
