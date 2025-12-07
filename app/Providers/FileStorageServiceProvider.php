<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Ficheros\FileStorageStrategy;
use App\Services\Ficheros\LocalFileStorageStrategy;
use App\Services\Ficheros\S3FileStorageStrategy;

class FileStorageServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(FileStorageStrategy::class, function () {
            $disk = config('filesystems.default');
            return $disk === 's3'
                ? new S3FileStorageStrategy()
                : new LocalFileStorageStrategy();
        });
    }
}
