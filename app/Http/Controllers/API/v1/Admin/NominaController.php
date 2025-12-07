<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\File;
use App\Models\TipoFichero;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Resources\FileResource;
use App\Http\Requests\Nomina\HistoricoNominasIndexRequest;
use App\Traits\HandlesNominaFiles;

class NominaController extends Controller
{
    use HandlesNominaFiles;
    /**
     * Display a listing of the resource.
     */
    public function index(HistoricoNominasIndexRequest $request)
    {
        $tipoArchivoId = TipoFichero::where('nombre', 'Archivo')->first()->id;

        try {
            $files = File::with(['user', 'createdBy'])
                ->where('tipo_fichero_id', $tipoArchivoId)
                ->where('path', 'like', '%Nominas%')
                ->nominas()
                ->get();

            return response()->json(status: Response::HTTP_OK, data: [
                'nominas' => FileResource::collection($files),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener nóminas: ' . $e->getMessage());
            return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data: [
                'error' => 'Error al obtener las nóminas',
                'message' => $e->getMessage()
            ]);
        }
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
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'parent_id' => 'required|exists:files,id',
            'description' => 'nullable|string|max:255',
            'nivel_acceso_id' => 'required|exists:nivel_accesos,id',
            'nivel_seguridad_id' => 'required|exists:nivel_seguridads,id',
        ]);

        try {
            $uploadedFile = $request->file('file');

            // Obtener el tipo de fichero para archivos
            $tipoArchivo = TipoFichero::where('nombre', 'Archivo')->first();

            // Usar el FileStorageStrategy existente
            $storageStrategy = app(\App\Services\Ficheros\FileStorageStrategy::class);

            // Obtener la carpeta padre
            $parentFolder = File::findOrFail($request->parent_id);

            // Verificar que la ruta es para nóminas
            if (strpos($parentFolder->path, '/Nominas/') === false) {
                return response()->json([
                    'error' => 'La carpeta seleccionada no es una carpeta de nóminas'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Generar path para el archivo
            $fileName = $uploadedFile->getClientOriginalName();
            $path = $parentFolder->path . '/' . $fileName;

            // Almacenar el archivo usando el storage strategy
            $storedPath = $storageStrategy->storeFile($uploadedFile, dirname($path));

            // Crear registro en la base de datos
            $file = File::create([
                'user_id' => $request->user() ? $request->user()->id : null,
                'created_by' => $request->user() ? $request->user()->id : null,
                'nivel_acceso_id' => $request->nivel_acceso_id,
                'tipo_fichero_id' => $tipoArchivo->id,
                'nivel_seguridad_id' => $request->nivel_seguridad_id,
                'parent_id' => $request->parent_id,
                'extension_id' => $this->getExtensionId($fileName),
                'hash' => \Illuminate\Support\Str::random(40),
                'nombre' => pathinfo($fileName, PATHINFO_FILENAME),
                'path' => $path,
                'size' => $uploadedFile->getSize(),
                'is_erasable' => true,
                'is_visible' => true,
                'is_sharable' => false,
                'description' => $request->description,
            ]);

            // Disparar evento para nóminas
            $this->dispatchNominaCreatedEvent($file);

            return response()->json([
                'message' => 'Nómina subida correctamente',
                'file' => new FileResource($file)
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            Log::error('Error al subir nómina: ' . $e->getMessage());

            return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data: [
                'error' => 'Error al subir el archivo',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(File $file)
    {
        if (!$this->isNominaFile($file)) {
            return response()->json(status: Response::HTTP_BAD_REQUEST, data: [
                'error' => 'El archivo solicitado no es una nómina'
            ]);
        }

        return response()->json(status: Response::HTTP_OK, data: [
            'nomina' => new FileResource($file)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, File $file)
    {
        if (!$this->isNominaFile($file)) {
            return response()->json(status:  Response::HTTP_BAD_REQUEST, data: [
                'error' => 'El archivo que intenta actualizar no es una nómina'
            ]);
        }

        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:255',
            'nivel_acceso_id' => 'sometimes|exists:nivel_accesos,id',
            'nivel_seguridad_id' => 'sometimes|exists:nivel_seguridads,id',
        ]);

        try {
            $file->update($request->only([
                'nombre',
                'description',
                'nivel_acceso_id',
                'nivel_seguridad_id'
            ]));

            // Disparar evento para nóminas
            $this->dispatchNominaUpdatedEvent($file);

            return response()->json(status:  Response::HTTP_OK, data:[
                'message' => 'Nómina actualizada correctamente',
                'file' => new FileResource($file)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar nómina: ' . $e->getMessage());

            return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data:[
                'error' => 'Error al actualizar el archivo',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file)
    {
        if (!$this->isNominaFile($file)) {
            return response()->json(status: Response::HTTP_BAD_REQUEST, data:[
                'error' => 'El archivo que intenta eliminar no es una nómina'
            ]);
        }

        try {
            // Guardar copia para el evento
            $fileCopy = clone $file;

            // Eliminar archivo físico
            $storageStrategy = app(\App\Services\Ficheros\FileStorageStrategy::class);
            $storageStrategy->deleteFile($file->path);

            // Eliminar registro
            $file->delete();

            // Disparar evento para nóminas
            $this->dispatchNominaDeletedEvent($fileCopy);

            return response()->json(status: Response::HTTP_OK, data:[
                'message' => 'Nómina eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar nómina: ' . $e->getMessage());

            return response()->json(status: Response::HTTP_INTERNAL_SERVER_ERROR, data:[
                'error' => 'Error al eliminar el archivo',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtiene el ID de extensión basado en el nombre del archivo
     */
    private function getExtensionId(string $fileName): ?int
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        return \App\Models\ExtensionFichero::where('nombre', $extension)->value('id');
    }
}
