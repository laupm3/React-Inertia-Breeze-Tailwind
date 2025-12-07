<?php

namespace App\Models;

use lluminate\Support\Collection;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Extends SpatieRole to add custom methods and properties.
 * 
 * You might set a public property like guard_name or connection, or override other Eloquent Model methods/properties
 * 
 * @link https://spatie.be/docs/laravel-permission/v6/advanced-usage/extending
 */
class Role extends SpatieRole
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'guard_name',
    ];

    /**
     * Relationships that should be loaded by default when the model is retrieved.
     */
    public const RELATIONSHIPS = [
        'permissions',
        'users'
    ];

    /**
     * A role may be given various permissions.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            config('permission.models.permission'),
            config('permission.table_names.role_has_permissions'),
            app(PermissionRegistrar::class)->pivotRole,
            app(PermissionRegistrar::class)->pivotPermission
        );
    }

    /**
     * Check if the role has a permission, revoking it if it does, or giving it if it doesn't.
     * 
     * @return bool False if the permission was revoked, true if it was given.
     */
    public function togglePermission(Permission $permission): bool
    {
        $roleHasPermission = $this->hasPermissionTo($permission);

        if ($roleHasPermission) {
            $this->revokePermissionTo($permission);
        } else {
            $this->givePermissionTo($permission);
        }

        return !$roleHasPermission;
    }

    /**
     * Get the modules that belong to the role through permissions.
     * 
     * @return Collection <App\Models\Module>
     */
    public function modules()
    {
        return $this->permissions()->with('module');
    }
}
