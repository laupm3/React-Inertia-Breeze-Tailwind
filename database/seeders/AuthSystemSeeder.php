<?php

namespace Database\Seeders;

use App\Enums\ProjectType;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class AuthSystemSeeder extends Seeder
{
    /**
     * This role is an alias for all roles in the system.
     */
    const ALL_ROLE_NAME = 'All';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authSystem = json_decode(file_get_contents(database_path('data/permissions.json')), true);

        $modules = $authSystem['modules'];

        $modules = collect($modules)->map(function ($module) {
            /**
             * @var \App\Models\Module $module
             */
            $module = Module::create([
                'name' => $module['name'],
                'description' => $module['description'],
                'project' => ProjectType::RRHH->value
            ]);

            return $module;
        })->keyBy('name');


        $roles = $authSystem['roles'];

        // Filter out the 'All' role, as it is not needed in the database.
        $roles = collect($roles)->filter(fn($role) => $role['name'] !== 'All')->map(function ($role) use ($modules) {
            /** @var \App\Models\Role $role */
            $role = Role::create([
                'name' => $role['name'],
                'description' => substr($role['description'], 0, 255),
            ]);

            return $role;
        })->keyBy('name');


        $permissions = $authSystem['permissions'];

        $superAdminRole = $roles->get('Super Admin');

        $permissions = collect($permissions)->each(function ($permission) use ($modules, $roles, $superAdminRole) {
            $module = $modules->get($permission['module']);

            $rolesFromString = isset($permission['roles'])
                ? array_map(fn($roleString) => trim($roleString), explode(',', $permission['roles']))
                : [];

            $rolesFromPermission = (isset($permission['roles']))
                ? $roles->whereIn('name', $rolesFromString)
                : collect([]);

            $permission = Permission::create([
                'name' => $permission['name'],
                'title' => $permission['title'],
                'description' => $permission['description'],
                'module_id' => $module['id'],
            ]);

            if (in_array(self::ALL_ROLE_NAME, $rolesFromString)) {
                $roles->each(function ($role) use ($permission) {
                    $role->givePermissionTo($permission);
                });
            } else {
                $rolesFromPermission->each(function ($role) use ($permission) {
                    $role->givePermissionTo($permission);
                });
            }

            if (!$superAdminRole->hasPermissionTo($permission, 'web')) {
                $superAdminRole->givePermissionTo($permission);
            }
        });
    }
}
