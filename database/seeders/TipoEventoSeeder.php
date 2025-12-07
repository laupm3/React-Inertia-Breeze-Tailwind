<?php

namespace Database\Seeders;

use App\Models\TipoEvento;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TipoEventoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TipoEvento::factory()->create([
            'nombre' => 'Personal',
            'descripcion' => 'Eventos personales',
            'color' => '#ad46ff',
        ]);

        TipoEvento::factory()->create([
            'nombre' => 'Equipo',
            'descripcion' => 'Eventos de equipo',
            'color' => '#ff6900',
        ]);

        TipoEvento::factory()->create([
            'nombre' => 'Departamento',
            'descripcion' => 'Eventos de departamento',
            'color' => '#d08700',
        ]);

        TipoEvento::factory()->create([
            'nombre' => 'Empresa',
            'descripcion' => 'Eventos de empresa',
            'color' => '#2b7fff',
        ]);

        TipoEvento::factory()->create([
            'nombre' => 'Recursos Humanos',
            'descripcion' => 'Recursos Humanos want to see you',
            'color' => '#6a7282',
        ]);
    }
}
