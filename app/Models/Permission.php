<?php

namespace App\Models;

use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * Extends SpatiePermission to add custom methods and properties.
 * 
 * @link https://spatie.be/docs/laravel-permission/v6/advanced-usage/extending
 */
class Permission extends SpatiePermission
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'guard_name',
        'module_id'
    ];

    /**
     * Default relationships to load when retrieving the model.
     * 
     * @var array<string>
     */
    public const RELATIONSHIPS = [
        'roles',
        'module',
    ];

    /**
     * A permission can be applied to roles.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            config('permission.models.role'),
            config('permission.table_names.role_has_permissions'),
            app(PermissionRegistrar::class)->pivotPermission,
            app(PermissionRegistrar::class)->pivotRole
        );
    }

    /**
     * Get the module that owns the permission.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }
}
