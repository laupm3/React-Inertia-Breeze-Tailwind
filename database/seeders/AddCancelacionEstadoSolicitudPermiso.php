<?php

namespace Database\Seeders;

use App\Models\EstadoSolicitudPermiso;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddCancelacionEstadoSolicitudPermiso extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = [
            'Cancelación',
        ];

        foreach ($estados as $estado) {
            EstadoSolicitudPermiso::factory()->create([
                'nombre' => $estado,
            ]);
        }
    }
}
