<?php

namespace App\Providers;

use App\Models\Folder;
use App\Models\SolicitudPermiso;
use App\Policies\FolderPolicy;
use App\Policies\SolicitudPermisoPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        SolicitudPermiso::class => SolicitudPermisoPolicy::class,
        Folder::class => FolderPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
} 