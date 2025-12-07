<?php

namespace App\Providers;

use App\Interfaces\FileStorageInterface;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Services\Storage\DirectoryManagementService;
use App\Services\Storage\FileSystemService;
use App\Services\Storage\FileUploadService;
use App\Services\Storage\FolderService;
use App\Services\Storage\LocalFileStorage;
use App\Services\Storage\DownloadService;
use App\Services\Storage\S3FileStorage;
use App\Services\Team\TeamPermissionService;
use Illuminate\Contracts\Foundation\Application;
use App\Services\ViewTrackingService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar la implementación de almacenamiento de archivos como singleton
        // Esto asegura que se use la misma instancia durante toda la aplicación
        $this->app->singleton(FileStorageInterface::class, function (Application $app) {
            return match (config('filesystems.default', 'local')) {
                'r2_cloudfare' => new S3FileStorage(),
                'local' => new LocalFileStorage(),
                default => new LocalFileStorage(),
            };
        });

        // Registrar FileSystemService como singleton
        $this->app->singleton(FileSystemService::class, function (Application $app) {
            return new FileSystemService(
                $app->make(FileStorageInterface::class)
            );
        });

        // Registrar FolderService como singleton
        $this->app->singleton(FolderService::class, function (Application $app) {
            return new FolderService();
        });

        // Registrar FileUploadService como singleton
        $this->app->singleton(FileUploadService::class, function (Application $app) {
            return new FileUploadService(
                $app->make(FileSystemService::class),
                $app->make(FolderService::class)
            );
        });

        // Registrar DirectoryManagementService como singleton
        $this->app->singleton(DirectoryManagementService::class, function (Application $app) {
            return new DirectoryManagementService(
                $app->make(FolderService::class),
                $app->make(FileSystemService::class)
            );
        });

        // Registrar DownloadService como singleton
        $this->app->singleton(DownloadService::class, function (Application $app) {
            return new DownloadService(
                $app->make(FolderService::class),
                $app->make(FileSystemService::class)
            );
        });

        $this->app->singleton(ViewTrackingService::class, function ($app) {
            return new ViewTrackingService();
        });

        $this->app->singleton(TeamPermissionService::class, function ($app) {
            return new TeamPermissionService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 1);
    }
}
