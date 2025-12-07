<?php

namespace Database\Seeders;

use App\Models\NivelSeguridad;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NivelSeguridadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        NivelSeguridad::create([
            'nombre' => 'L1',
            'descripcion' => 'Nivel de seguridad por defecto, sin restricciones.',
        ]);

        NivelSeguridad::create([
            'nombre' => 'L2',
            'descripcion' => 'Nivel de seguridad medio, requiere verificación contraseña.',
        ]);

        NivelSeguridad::create([
            'nombre' => 'L3',
            'descripcion' => 'Nivel de seguridad alto, requiere 2FA.',
        ]);
    }
}
