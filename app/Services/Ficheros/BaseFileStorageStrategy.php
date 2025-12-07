<?php

namespace App\Services\Ficheros;

use Illuminate\Http\UploadedFile;
use App\Models\File;
use Illuminate\Support\Facades\Storage;

abstract class BaseFileStorageStrategy implements FileStorageStrategy
{
    protected string $disk;

    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    public function allFiles(string $path = ''): array
    {
        return Storage::disk($this->disk)->allFiles($path);
    }

    // Métodos abstractos para los que cambian según el disco
    abstract public function storeFile(UploadedFile $file, string $path, array $options = []): string;
    abstract public function deleteFile(string $path): bool;
    abstract public function deleteDirectory(string $path): bool;
    abstract public function createDirectory(string $path): bool;
    abstract public function moveFile(string $from, string $to): bool;
    abstract public function moveDirectory(string $from, string $to): bool;
    abstract public function downloadFile(File $file, bool $preview = false);
    abstract public function getFileInfo(string $path): ?array;
}
