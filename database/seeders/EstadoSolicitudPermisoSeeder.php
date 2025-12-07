<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoSolicitudPermiso;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;


class EstadoSolicitudPermisoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = [
            'Solicitado',
            'En revisión',
            'En proceso',
            'Aprobado',
            'Denegado',
        ];

        foreach ($estados as $estado) {
            EstadoSolicitudPermiso::factory()->create([
                'nombre' => $estado,
            ]);
        }
    }
}
