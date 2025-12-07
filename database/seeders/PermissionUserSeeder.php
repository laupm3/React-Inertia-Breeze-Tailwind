<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = Permission::all();

        $users = User::all();

        $permissions->each(function ($permission) use ($users) {
            $permission->users()->attach(
                $users->random(rand(1, 5))->pluck('id')->toArray()
            );
        });
    }
}
