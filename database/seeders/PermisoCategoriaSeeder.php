<?php

namespace Database\Seeders;

use App\Models\PermisoCategoria;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermisoCategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PermisoCategoria::create([
            'name' => 'Permisos médicos',
            'description' => 'Todos aquellos permisos que involucren una enfermedad o malestar físico, que requiera de un médico para su justificación o especialistas'
        ]);

        PermisoCategoria::create([
            'name' => 'Otros permisos',
            'description' => 'Todos aquellos permisos que no se encuentren en la categoría de permisos médicos, vacaciones, permisos por maternidad, paternidad, entre otros'
        ]);
    }
}
