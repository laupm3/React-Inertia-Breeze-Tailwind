<?php

namespace Database\Seeders;

use App\Models\Pais;
use Illuminate\Database\Seeder;

class PaisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Pais::create([
            'nombre' => 'España',
            'iso' => 'ES',
        ]);
        Pais::create([
            'nombre' => 'México',
            'iso' => 'MX',
        ]);
        Pais::create([
            'nombre' => 'Argentina',
            'iso' => 'AR',
        ]);
    }
}
