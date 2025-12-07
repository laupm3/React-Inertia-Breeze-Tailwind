<?php

namespace App\Services\Ficheros;

use Illuminate\Http\UploadedFile;
use App\Models\File;

interface FileStorageStrategy
{
    public function storeFile(UploadedFile $file, string $path, array $options = []): string;
    public function deleteFile(string $path): bool;
    public function deleteDirectory(string $path): bool;
    public function createDirectory(string $path): bool;
    public function moveFile(string $from, string $to): bool;
    public function moveDirectory(string $from, string $to): bool;
    public function exists(string $path): bool;
    public function allFiles(string $path = ''): array;
    public function downloadFile(File $file, bool $preview = false);
    public function getFileInfo(string $path): ?array;
    public function getSignedDownloadUrl(File $file): string;
}
