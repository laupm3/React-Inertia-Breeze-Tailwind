<?php

namespace Database\Seeders;

use App\Models\Modalidad;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ModalidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Modalidad::create([
            'name' => 'Presencial',
            'description' => 'Modalidad presencial, el trabajo se realiza en un lugar físico.'
        ]);

        Modalidad::create([
            'name' => 'Remoto',
            'description' => 'Modalidad remota, el trabajo se realiza de forma virtual.'
        ]);

        Modalidad::create([
            'name' => 'Híbrido',
            'description' => 'Modalidad híbrida, el trabajo se realiza de forma presencial y remota.'
        ]); 
    }
}
