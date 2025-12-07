<?php

namespace App\Services\Ficheros;

use App\Models\ExtensionFichero;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use App\Models\File;
use League\Flysystem\FilesystemException;
use League\Flysystem\StorageAttributes;

class S3FileStorageStrategy extends BaseFileStorageStrategy
{
    protected string $disk = 's3';

    public function storeFile(UploadedFile $file, string $path, array $options = []): string
    {
        return Storage::disk($this->disk)->putFileAs($path, $file, $file->getClientOriginalName(), $options);
    }

    public function deleteFile(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }

    public function deleteDirectory(string $path): bool
    {
        return Storage::disk($this->disk)->deleteDirectory($path);
    }

    public function createDirectory(string $path): bool
    {
        // Elimina cualquier barra final
        $path = rtrim($path, '/');
        // S3 no tiene carpetas reales, pero puedes crear un marcador
        return (bool) Storage::disk($this->disk)->put($path . '/.keep', '');
    }

    public function moveFile(string $from, string $to): bool
    {
        Storage::disk($this->disk)->copy($from, $to);
        return Storage::disk($this->disk)->delete($from);
    }

    public function moveDirectory(string $from, string $to): bool
    {
        $disk = Storage::disk($this->disk);
        $allFiles = $disk->allFiles($from);
        foreach ($allFiles as $file) {
            $newFile = preg_replace('#^' . preg_quote($from, '#') . '#', $to, $file);
            $disk->copy($file, $newFile);
            $disk->delete($file);
        }
        return true;
    }

    public function downloadFile(File $file, bool $preview = false)
    {
        $expiration = now()->addMinutes(1);
        $disposition = $preview ? 'inline' : 'attachment';
        $extension = ExtensionFichero::where('id', $file->extension_id)->value('nombre') ?? 'bin';
        $headers = [
            'ResponseContentDisposition' => $disposition . '; filename="' . $file->nombre . '.' . $extension . '"'
        ];
        if ($preview) {
            $headers['ResponseContentType'] = 'application/pdf';
        }
        $url = Storage::disk($this->disk)->temporaryUrl($file->path, $expiration, $headers);
        return redirect()->away($url);
    }

    public function allFiles(string $path = ''): array
    {
        return Storage::disk($this->disk)->allFiles($path);
    }

    public function getFileInfo(string $path): ?array
    {
        try {
            $disk = Storage::disk($this->disk);
            if (!$disk->exists($path)) {
                return null;
            }
            return [
                'path' => $path,
                'size' => $disk->size($path),
                'mime_type' => $disk->mimeType($path),
                'last_modified' => $disk->lastModified($path),
                'url' => $disk->url($path),
            ];
        } catch (\Throwable $e) {
            //return $e->getMessage();
            return null;
        }
    }

    public function getSignedDownloadUrl(File $file): string
    {
        $expiration = now()->addMinutes(1);
        $disposition = 'attachment';
    
        // Obtener extensión (sin punto)
        $extension = ExtensionFichero::where('id', $file->extension_id)->value('nombre') ?? 'bin';
    
        // Verificar si el nombre ya tiene esa extensión (insensible a mayúsculas/minúsculas)
        $nombreArchivo = $file->nombre;
        if (!str_ends_with(strtolower($nombreArchivo), '.' . strtolower($extension))) {
            $nombreArchivo .= '.' . $extension;
        }
    
        $headers = [
            'ResponseContentDisposition' => $disposition . '; filename="' . $nombreArchivo . '"'
        ];
    
        return Storage::disk($this->disk)->temporaryUrl($file->path, $expiration, $headers);
    }
}
