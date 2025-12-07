<?php

namespace Database\Seeders;

use App\Enums\ProjectType;
use App\Models\Module;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            // Módulos RRHH
            [
                'name' => 'users',
                'description' => 'User module - Habilita la gestión de usuarios',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'empleados',
                'description' => 'Employee module - Habilita la gestión de empleados',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'role',
                'description' => 'Role module - Habilita la gestión de roles',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'permission',
                'description' => 'Permission module- Habilita la gestión de permisos',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'departamentos',
                'description' => 'Department module - Habilita la gestión de departamentos',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'centros',
                'description' => 'Center module - Habilita la gestión de centros',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'empresas',
                'description' => 'Company module - Habilita la gestión de empresas',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'contratos',
                'description' => 'Contract module - Habilita la gestión de contratos',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'notifications',
                'description' => 'Notification module - Habilita la gestión de notificaciones',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'vacations',
                'description' => 'Vacation module - Habilita la gestión de vacaciones',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'organization',
                'description' => 'Organization module - Habilita la gestión de la organización',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'onboarding',
                'description' => 'Onboarding module - Habilita la gestión de la incorporación',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'calendar',
                'description' => 'Calendar module - Habilita la gestión de calendario',
                'project' => ProjectType::RRHH
            ],
            [
                'name' => 'document',
                'description' => 'Document module - Habilita la gestión de documentos',
                'project' => ProjectType::RRHH
            ],
            
            // Módulos Inventory (para futuras expansiones)
            [
                'name' => 'products',
                'description' => 'Product module - Habilita la gestión de productos',
                'project' => ProjectType::INVENTORY
            ],
            [
                'name' => 'orders',
                'description' => 'Order module - Habilita la gestión de órdenes',
                'project' => ProjectType::INVENTORY
            ],
            [
                'name' => 'transfers',
                'description' => 'Transfer module - Habilita la gestión de transferencias',
                'project' => ProjectType::INVENTORY
            ],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }
    }
}
