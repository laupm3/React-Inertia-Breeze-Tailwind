<?php

namespace App\Services\Ficheros;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use App\Models\File;
use Illuminate\Support\Facades\URL;

class LocalFileStorageStrategy extends BaseFileStorageStrategy
{
    protected string $disk = 'local';

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
        return Storage::disk($this->disk)->makeDirectory($path);
    }

    public function moveFile(string $from, string $to): bool
    {
        return Storage::disk($this->disk)->move($from, $to);
    }

    public function moveDirectory(string $from, string $to): bool
    {
        $disk = Storage::disk($this->disk);

        // Si la carpeta existe y no hay conflicto, renombra directamente
        $fromPath = $disk->path($from);
        $toPath = $disk->path($to);

        if (is_dir($fromPath) && !is_dir($toPath)) {
            // Intenta renombrar la carpeta física
            rename($fromPath, $toPath);
            return true;
        }

        // Si no se puede renombrar, mueve los archivos uno a uno (fallback)
        $allFiles = $disk->allFiles($from);
        foreach ($allFiles as $file) {
            $newFile = preg_replace('#^' . preg_quote($from, '#') . '#', $to, $file);
            $disk->move($file, $newFile);
        }

        // Limpia la carpeta antigua si queda vacía
        if (is_dir($fromPath) && count(scandir($fromPath)) <= 2) { // solo . y ..
            rmdir($fromPath);
        }

        return true;
    }

    public function downloadFile(File $file, bool $preview = false, bool $temporaryUrl = false)
    {
        if ($temporaryUrl) {
            // Retorna una URL firmada válida por 1 minuto
            return URL::signedRoute(
                'admin.files.download.local', // Asegúrate de tener esta ruta definida
                ['hash' => $file->hash],
                now()->addMinutes(1)
            );
        }

        $absolutePath = Storage::disk($this->disk)->path($file->path);
        if ($preview) {
            return response()->file($absolutePath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . basename($file->path) . '"',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }
        return response()->download($absolutePath);
    }

    public function allFiles(string $path = ''): array
    {
        $items = File::pluck('path')->toArray();
        return $items;
    }

    public function getFileInfo(string $path): ?array
    {
        $disk = Storage::disk($this->disk);

        if (!$disk->exists($path)) {
            return null;
        }

        /* $request->validate([
            'path' => 'required|string',
        ]); */

        /* $path = $request->input('path'); */
        $file = File::where('path', $path)->first();

        return [
            new \App\Http\Resources\FileResource($file)
        ];
    }

    public function temporaryUrl(File $file, $expiration = 1)
    {
        return URL::signedRoute(
            'download.local',
            ['file' => $file->id],
            now()->addMinutes($expiration)
        );
    }

    public function getSignedDownloadUrl(File $file): string
    {
        return URL::signedRoute('admin.files.download.local', ['hash' => $file->hash], now()->addMinutes(1));
    }
}
