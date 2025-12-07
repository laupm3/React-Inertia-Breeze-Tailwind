<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all the roles availables in the database
        $roles = Role::all();

        $users = User::all();

        $users->each(function ($user) use ($roles) {
            $user->assignRole($roles->random());
        });
    }
}
