<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use App\Models\ExtensionFichero;
use App\Traits\HandlesNominaFiles;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    use HandlesNominaFiles;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ... código existente para almacenar el archivo ...

        // Ejemplo de código que podría existir en el método store:
        $file = File::create([
            'user_id' => auth()->id(),
            'created_by' => auth()->id(),
            'nivel_acceso_id' => $request->nivel_acceso_id,
            'tipo_fichero_id' => $request->tipo_fichero_id,
            'nivel_seguridad_id' => $request->nivel_seguridad_id,
            'parent_id' => $request->parent_id,
            'extension_id' => $request->extension_id,
            'hash' => $hash,
            'nombre' => $request->nombre,
            'path' => $path,
            'size' => $size,
            // ... otros campos ...
        ]);

        // Verificar si es una nómina y disparar el evento correspondiente
        $this->dispatchNominaCreatedEvent($file);

        return redirect()->back()->with('success', 'Archivo subido correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, File $file)
    {
        // ... código existente para actualizar el archivo ...

        // Ejemplo de código que podría existir en el método update:
        $file->update([
            'nivel_acceso_id' => $request->nivel_acceso_id,
            'nivel_seguridad_id' => $request->nivel_seguridad_id,
            'nombre' => $request->nombre,
            // ... otros campos ...
        ]);

        // Verificar si es una nómina y disparar el evento correspondiente
        $this->dispatchNominaUpdatedEvent($file);

        return redirect()->back()->with('success', 'Archivo actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file)
    {
        // Guardar una referencia del archivo antes de eliminarlo
        $fileCopy = clone $file;

        // ... código existente para eliminar el archivo ...

        // Ejemplo de código que podría existir en el método destroy:
        $storageStrategy = app(\App\Services\Ficheros\FileStorageStrategy::class);
        $storageStrategy->deleteFile($file->path);
        $file->delete();

        // Verificar si era una nómina y disparar el evento correspondiente
        $this->dispatchNominaDeletedEvent($fileCopy);

        return redirect()->back()->with('success', 'Archivo eliminado correctamente');
    }

    /**
     * Generar una URL firmada para un archivo privado.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $fileName
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateSignedRoute(string $hash)
    {
        $file = File::where('hash', $hash)->first();

        // Si el archivo no se encuentra, retornar un error 404
        if (!$file) {
            abort(404, 'Archivo no encontrado en la base de datos');
        }

        $extension_fichero = ExtensionFichero::where('id', $file->extension_id)->first()->nombre;

        // Check if this is a PDF file and use the dedicated preview endpoint
        if (strtolower($extension_fichero) === 'pdf' && request()->has('preview')) {
            return $this->generatePdfPreviewRoute($hash);
        }

        // Tiempo de expiración del enlace (ejemplo: 5 minutos para previsualización)
        $expiration = now()->addMinutes(5);

        // Generar la URL firmada con el nombre visible y el hash incluido en la firma
        $signedUrl = URL::signedRoute('files.download', [
            'nombre' => "$file->nombre.$extension_fichero",
            'hash' => $hash,
            'preview' => 'true', // Agregar parámetro para indicar previsualización
        ], $expiration);

        // Retornar la URL firmada
        return response()->json(['url' => $signedUrl]);
    }


    /**
     * Download a file from the storage - This method verifies the signature of the link and serves the file as download using the hash
     *
     * @param string $hash The hash of the file to download
     */
    public function download(string $hash)
    {
        // Validar la firma del enlace
        if (!request()->hasValidSignature()) {
            abort(403, 'Enlace no válido o expirado');
        }

        // Obtener el hash desde la firma
        $hash = request()->query('hash');

        // Buscar el archivo en la base de datos usando el hash
        $file = File::where('hash', $hash)->first();

        if (!$file) {
            abort(404, 'Archivo no encontrado en la base de datos');
        }

        $disk = config('filesystems.default'); // o 's3' directamente si solo usas S3

        if (Storage::disk($disk)->exists($file->path)) {
            // Para S3, generar una URL temporal
            if ($disk === 's3') {
                $expiration = now()->addMinutes(1);
                $disposition = request()->query('preview') === 'true' ? 'inline' : 'attachment';
                $headers = [
                    'ResponseContentDisposition' => $disposition . '; filename="' . basename($file->path) . '"'
                ];
                // Si es preview, forzar Content-Type PDF
                if (request()->query('preview') === 'true') {
                    $headers['ResponseContentType'] = 'application/pdf';
                }
                $url = Storage::disk('s3')->temporaryUrl(
                    $file->path,
                    $expiration,
                    $headers
                );
                // Redirigir al usuario a la URL temporal de S3
                return redirect()->away($url);
            } else {
                // Local disk (por compatibilidad)
                $absolutePath = Storage::disk($disk)->path($file->path);
                if (request()->query('preview') === 'true') {
                    return response()->file($absolutePath, [
                        'Content-Type' => 'application/pdf',
                        'Content-Disposition' => 'inline; filename="' . basename($file->path) . '"',
                        'Access-Control-Allow-Origin' => '*',
                    ]);
                }
                return response()->download($absolutePath);
            }
        }

        abort(404, 'Archivo no encontrado');
    }


    /**
     * Generate a signed URL specifically for PDF preview
     *
     * @param string $hash
     * @return \Illuminate\Http\JsonResponse
     */
    public function generatePdfPreviewRoute(string $hash)
    {
        $file = File::where('hash', $hash)->first();

        // Si el archivo no se encuentra, retornar un error 404
        if (!$file) {
            abort(404, 'Archivo no encontrado en la base de datos');
        }

        // Check if file is a PDF
        $extension = ExtensionFichero::where('id', $file->extension_id)->first()->nombre;
        if (strtolower($extension) !== 'pdf') {
            return response()->json(['error' => 'El archivo no es un PDF'], 400);
        }

        // Tiempo de expiración del enlace (10 minutos para previsualización)
        $expiration = now()->addMinutes(10);

        // Generar la URL firmada para preview de PDF
        $signedUrl = URL::signedRoute('files.previewPdf', [
            'hash' => $hash
        ], $expiration);

        // Retornar la URL firmada
        return response()->json(['url' => $signedUrl]);
    }

    /**
     * Preview a PDF file using a signed URL.
     */
    public function previewPdf(Request $request, string $hash)
    {
        // Validate signature
        if (!$request->hasValidSignature()) {
            abort(403, 'Invalid or expired signature');
        }

        $file = File::where('hash', $hash)->first();
        if (!$file) {
            abort(404, 'File not found');
        }

        if (Storage::disk('hr')->exists($file->path)) {
            $absolutePath = Storage::disk('hr')->path($file->path);

            // Enhanced headers for browser compatibility
            return response()->file($absolutePath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . basename($file->path) . '"',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, X-Requested-With, Range',
                'Access-Control-Expose-Headers' => 'Content-Length, Content-Range, Accept-Ranges',
                'Cache-Control' => 'no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);
        }

        abort(404, 'File not found');
    }

    private function generateSignedUrl(File $file, string $routeName, int $expirationMinutes): string
    {
        return URL::signedRoute($routeName, [
            'hash' => $file->hash,
        ], now()->addMinutes($expirationMinutes));
    }
}
