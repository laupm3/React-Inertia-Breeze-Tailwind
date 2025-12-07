<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\NivelAcceso;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

class NivelAccesoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /**
         * @var Module $module
         */
        $module = Module::where('name', 'Carpetas y archivos')->first();

        /**
         * @var Collection<Permission>
         */
        $permissions = $module->permissions;

        NivelAcceso::create([
            'permission_id' => $permissions->where('name', 'confidentialFilesAccess')->first()->id,
            'nombre' => 'Crítico',
            'descripcion' => 'Acceso crítico, solo para administradores. (Ejemplo: superadmin, root)',
        ]);

        NivelAcceso::create([
            'permission_id' => $permissions->where('name', 'limitedFilesAccess')->first()->id,
            'nombre' => 'Alto',
            'descripcion' => 'Acceso alto, para usuarios con permisos especiales. (Ejemplo: recursos humanos, desarrolladores)',
        ]);

        NivelAcceso::create([
            'permission_id' => $permissions->where('name', 'publicFilesAccess')->first()->id,
            'nombre' => 'Medio',
            'descripcion' => 'Acceso medio, para usuarios con permisos básicos. (Ejemplo: managers, supervisores)',
        ]);

        NivelAcceso::create([
            'permission_id' => $permissions->where('name', 'publicFilesAccess')->first()->id,
            'nombre' => 'Bajo',
            'descripcion' => 'Acceso bajo, para usuarios con permisos mínimos. (Ejemplo: empleados, usuarios)',
        ]);
    }
}
