<?php

namespace App\Http\Controllers\Admin;

use App\Models\File;
use App\Models\ExtensionFichero;
use App\Models\TipoFichero;
use App\Models\NivelSeguridad;
use App\Models\NivelAcceso;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Services\Ficheros\FileStorageStrategy;
use Illuminate\Support\Facades\URL;

class FicheroController extends Controller
{
    protected FileStorageStrategy $storage;

    public function __construct(FileStorageStrategy $storage)
    {
        $this->storage = $storage;
    }

    /**
     * Muestra todos los ficheros.
     */
    public function index()
    {
        $ficheros = File::all();
        //return response()->json($ficheros);
    }

    /**
     * Muestra el formulario de creación.
     */
    public function create()
    {
        return response()->json(['message' => 'Create() en FicheroController']);
    }

    /**
     * Almacena los archivos en la ruta seleccionada.
     */
    public function storeFiles(Request $request): JsonResponse
    {
        set_time_limit(120);

        try {
            $request->validate([
                'files'         => 'required|array',
                'files.*'       => 'file|max:204800',
                'path_selected' => 'required|string|exists:files,path',
            ]);

            $tiposFicheros     = TipoFichero::all()->keyBy('nombre');
            $nivelesSeguridad  = NivelSeguridad::all()->keyBy('nombre');
            $nivelesAcceso     = NivelAcceso::all()->keyBy('nombre');
            $extensionCache    = ExtensionFichero::all()->keyBy('nombre');
            $carpetaGlobalEmpleados = File::where('nombre', 'Empleados')->first();

            $files = $request->file('files');
            if (!is_array($files)) {
                return response()->json(['message' => 'No se han recibido archivos.'], Response::HTTP_BAD_REQUEST);
            }

            $enviarTodos = $request->input('enviar_todos', 'false') === 'true';
            $empresa = trim($request->input('enviar_empresa', ''));
            $centro = trim($request->input('enviar_centro', ''));
            $departamento = trim($request->input('enviar_departamento', ''));

            $hasEmpresa = $empresa !== '';
            $hasCentro = $centro !== '';
            $hasDepartamento = $departamento !== '';

            if ($enviarTodos) {
                $empleados = Empleado::with('user')->get();
            } elseif ($hasEmpresa || $hasCentro || $hasDepartamento) {
                $empleados = $this->getFilteredEmployees($request);
            } else {
                // Solo el usuario actual
                $user = Auth::user();
                $empleado = $user->empleado;
                $empleados = $empleado ? collect([$empleado]) : collect();
            }

            if ($empleados->isEmpty()) {
                return response()->json(['message' => 'No se encontraron empleados destino.'], Response::HTTP_BAD_REQUEST);
            }

            $acceptedFilesData = [];
            $fileErrors = [];
            $archivosCreados = [];
            $folderCache = [];
            $carpetasActualizadas = [];
            $bulkInsert = [];
            $existingNamesCache = [];
            $createdDirectories = [];

            foreach ($empleados as $empleado) {
                foreach ($files as $file) {
                    $originalName = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension();
                    $extensionModel = $extensionCache[$extension] ?? null;

                    // Construir la ruta destino para este empleado
                    $filePath = $this->buildEmployeeFilePath($request->input('path_selected'), $empleado, $originalName);

                    // Buscar o crear la carpeta destino para este empleado
                    $parentFolder = $this->ensureFoldersExist(
                        $filePath,
                        $empleado,
                        $carpetaGlobalEmpleados,
                        $tiposFicheros,
                        $nivelesSeguridad,
                        $nivelesAcceso,
                        $folderCache
                    );

                    if (!$parentFolder) {
                        $fileErrors[] = "No se pudo crear la carpeta destino para el empleado {$empleado->nif}";
                        continue;
                    }

                    if (!isset($existingNamesCache[$parentFolder->id])) {
                        $existingNamesCache[$parentFolder->id] = File::where('parent_id', $parentFolder->id)
                            ->where('tipo_fichero_id', $tiposFicheros['Archivo']->id)
                            ->pluck('nombre')
                            ->toArray();
                    }

                    $existsInDb = in_array($originalName, $existingNamesCache[$parentFolder->id]);
                    $fullStoragePath = rtrim($parentFolder->path, '/') . '/' . $originalName;
                    $existsInStorage = $this->storage->exists($fullStoragePath);

                    if ($existsInDb || $existsInStorage) {
                        $fileErrors[] = "Ya existe un archivo llamado '{$originalName}' en la carpeta seleccionada para el empleado con NIF {$empleado->nif}.";
                        continue;
                    }

                    // Crea el directorio solo una vez por carpeta
                    if (!isset($createdDirectories[$parentFolder->path])) {
                        if (!$this->storage->exists($parentFolder->path)) {
                            $this->storage->createDirectory($parentFolder->path);
                        }
                        $createdDirectories[$parentFolder->path] = true;
                    }

                    $this->storage->storeFile($file, $parentFolder->path);

                    $bulkInsert[] = [
                        'user_id'            => $empleado->user_id ?? $empleado->id,
                        'created_by'         => Auth::id(),
                        'tipo_fichero_id'    => $tiposFicheros['Archivo']->id,
                        'nivel_seguridad_id' => $nivelesSeguridad[$request->input('nivel_seguridad', 'L1')]->id ?? $nivelesSeguridad['L1']->id,
                        'nivel_acceso_id'    => $nivelesAcceso['Bajo']->id,
                        'parent_id'          => $parentFolder->id,
                        'extension_id'       => $extensionModel ? $extensionModel->id : null,
                        'hash'               => Str::uuid(),
                        'nombre'             => $originalName,
                        'size'               => $file->getSize(),
                        'path'               => $fullStoragePath,
                        'created_at'         => now(),
                        'updated_at'         => now(),
                    ];
                    $acceptedFilesData[] = $originalName;
                    $carpetasActualizadas[$parentFolder->id] = $parentFolder;
                    $existingNamesCache[$parentFolder->id][] = $originalName;
                }
            }

            if (count($bulkInsert) > 0) {
                File::insert($bulkInsert);
                $archivosCreados = File::whereIn('nombre', $acceptedFilesData)
                    ->whereIn('parent_id', array_keys($carpetasActualizadas))
                    ->orderBy('id', 'desc')
                    ->take(count($bulkInsert))
                    ->get();
            }

            foreach ($carpetasActualizadas as $carpeta) {
                $carpeta->qty_ficheros = File::where('parent_id', $carpeta->id)->count();
                $carpeta->save();
            }

            $status = count($acceptedFilesData) > 0 ? Response::HTTP_CREATED : Response::HTTP_BAD_REQUEST;
            $message = count($acceptedFilesData) > 0 ? "Archivos subidos correctamente." : "Ningún archivo se subió correctamente.";

            return response()->json([
                'message'  => $message,
                'accepted' => $acceptedFilesData,
                'errors'   => $fileErrors,
                'files'    => $archivosCreados,
            ], $status);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Ocurrió un error al subir los archivos: " . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Busca o crea solo las carpetas necesarias a partir del NIF del empleado.
     * No filtra por user_id para carpetas compartidas.
     */
    private function ensureFoldersExist($filePath, $empleado, $carpetaGlobalEmpleados, $tiposFicheros, $nivelesSeguridad, $nivelesAcceso, &$folderCache)
    {
        $pathParts = explode('/', $filePath);
        array_pop($pathParts); // Remove the file name

        // Construye progresivamente la ruta, creando solo lo que no existe
        $currentPath = '';
        $parentId = null;
        foreach ($pathParts as $i => $folderName) {
            $currentPath = $i === 0 ? $folderName : $currentPath . '/' . $folderName;

            if (isset($folderCache[$currentPath])) {
                $folder = $folderCache[$currentPath];
            } else {
                $folder = File::where('path', $currentPath)
                    ->where('tipo_fichero_id', $tiposFicheros['Carpeta']->id)
                    ->first();

                if (!$folder) {
                    $folder = File::create([
                        'user_id'            => $empleado->user_id ?? $empleado->id,
                        'created_by'         => Auth::id(),
                        'tipo_fichero_id'    => $tiposFicheros['Carpeta']->id,
                        'nivel_seguridad_id' => $nivelesSeguridad['L1']->id,
                        'nivel_acceso_id'    => $nivelesAcceso['Bajo']->id,
                        'parent_id'          => $parentId,
                        'extension_id'       => null,
                        'hash'               => Str::uuid(),
                        'nombre'             => $folderName,
                        'size'               => 0,
                        'path'               => $currentPath,
                    ]);
                    if (!$this->storage->exists($currentPath)) {
                        $this->storage->createDirectory($currentPath);
                    }
                }
                $folderCache[$currentPath] = $folder;
            }
            $parentId = $folder->id;
        }

        return $folderCache[$currentPath] ?? null;
    }

    /**
     * Construye la ruta de archivo para un empleado.
     */
    private function buildEmployeeFilePath($pathSelected, $empleado, $originalName)
    {
        $nif = $empleado->nif;
        $pathParts = explode('/', $pathSelected);

        // Buscar "Empleados" en la ruta
        $empleadosIdx = array_search('Empleados', $pathParts);

        if ($empleadosIdx !== false) {
            // Si después de "Empleados" hay un NIF, reemplázalo por el del empleado destino
            if (isset($pathParts[$empleadosIdx + 1]) && preg_match('/^[0-9A-Z]+$/i', $pathParts[$empleadosIdx + 1])) {
                $pathParts[$empleadosIdx + 1] = $nif;
            } else {
                // Si no hay NIF, lo insertamos
                array_splice($pathParts, $empleadosIdx + 1, 0, [$nif]);
            }
            $finalPath = implode('/', $pathParts) . '/' . $originalName;
            return $finalPath;
        }

        // Si no hay "Empleados" en la ruta, simplemente añade el NIF
        return rtrim($pathSelected, '/') . '/' . $nif . '/' . $originalName;
    }

    /**
     * Filtra empleados según los parámetros del request.
     */
    private function getFilteredEmployees(Request $request)
    {
        $query = Empleado::query();

        $empresa = trim($request->input('enviar_empresa', ''));
        $centro = trim($request->input('enviar_centro', ''));
        $departamento = trim($request->input('enviar_departamento', ''));

        if ($empresa !== '') {
            $query->whereHas('contratos.empresa', fn($q) => $q->where('empresas.id', $empresa));
        }
        if ($departamento !== '') {
            $query->whereHas('contratos.departamento', fn($q) => $q->where('departamentos.id', $departamento));
        }
        if ($centro !== '') {
            $query->whereHas('contratos.centro', fn($q) => $q->where('centros.id', $centro));
        }

        return $query->get();
    }

    /**
     * Crea una carpeta en la ruta especificada.
     */
    public function storeFolder(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nombre' => 'required|string',
                'parent_id' => 'required|exists:files,id',
            ]);

            $parent = File::findOrFail($request->parent_id);
            $path = $parent->path . '/' . $request->nombre;

            $exists = File::where('parent_id', $parent->id)
                ->where('nombre', $request->nombre)
                ->whereNull('deleted_at')
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'Ya existe una carpeta con ese nombre en la ubicación seleccionada.'], Response::HTTP_CONFLICT);
            }

            if (!$this->storage->exists($path)) {
                $this->storage->createDirectory($path);
            }

            $carpetaNueva = File::create([
                'user_id'            => Auth::id(),
                'created_by'         => Auth::id(),
                'tipo_fichero_id'    => TipoFichero::where('nombre', 'Carpeta')->first()->id,
                'nivel_seguridad_id' => NivelSeguridad::where('nombre', 'L1')->first()->id,
                'nivel_acceso_id'    => NivelAcceso::where('nombre', 'Bajo')->first()->id,
                'parent_id'          => $parent->id,
                'extension_id'       => null,
                'hash'               => Str::uuid(),
                'nombre'             => $request->nombre,
                'size'               => 0,
                'qty_ficheros'       => 0,
                'path'               => $path,
            ]);

            $parent->updateParentQtyFiles();

            return response()->json([
                'message' => 'Carpeta creada correctamente.',
                'carpeta' => $carpetaNueva
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Ocurrió un error al crear la carpeta: " . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Muestra un fichero.
     */
    public function show($id)
    {
        $file = File::with(['children', 'parent', 'tipoFichero', 'nivelSeguridad', 'nivelAcceso', 'extensionFichero', 'user', 'createdBy'])->findOrFail($id);
        return response()->json($file);
    }

    /**
     * Edita un fichero.
     */
    public function edit($id)
    {
        $file = File::findOrFail($id);
        return response()->json($file);
    }

    /**
     * Actualiza un fichero o carpeta.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $file = File::findOrFail($id);

            $request->validate([
                'nombre' => 'sometimes|string',
                'nivel_seguridad_id' => 'sometimes|exists:niveles_seguridad,id',
                'nivel_acceso_id' => 'sometimes|exists:niveles_acceso,id',
            ]);

            $data = $request->only(['nombre', 'nivel_seguridad_id', 'nivel_acceso_id']);
            $tiposFichero = TipoFichero::all()->keyBy('id');

            if (isset($data['nombre']) && $data['nombre'] !== $file->nombre) {
                $this->renameFileOrFolder($file, $data['nombre']);
                unset($data['nombre']);
            }

            $file->update($data);

            return response()->json([
                'file' => $file
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Ocurrió un error al actualizar el fichero: " . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Renombra un archivo o carpeta y actualiza rutas hijas si es necesario.
     */
    private function renameFileOrFolder(File $file, string $newName)
    {
        $oldPath = $file->path;
        $parentPath = $file->parent ? $file->parent->path : '';
        $newPath = $parentPath ? rtrim($parentPath, '/') . '/' . $newName : $newName;

        if ($file->tipoFichero && $file->tipoFichero->nombre === 'Carpeta') {
            $this->storage->moveDirectory($oldPath, $newPath);
            if (empty($this->storage->allFiles($newPath))) {
                $this->storage->createDirectory($newPath);
            }
            $this->updateChildrenPaths($file, $oldPath, $newPath);

            // Elimina la carpeta antigua si existe y está vacía
            if ($this->storage->exists($oldPath) && empty($this->storage->allFiles($oldPath))) {
                $this->storage->deleteDirectory($oldPath);
            }
        } else {
            if ($this->storage->exists($oldPath)) {
                $this->storage->moveFile($oldPath, $newPath);
            }
        }

        $file->path = $newPath;
        $file->nombre = $newName;
        $file->save();
    }

    /**
     * Actualiza las rutas de los hijos recursivamente tras renombrar una carpeta.
     */
    private function updateChildrenPaths(File $file, $oldPath, $newPath)
    {
        foreach ($file->children as $child) {
            $child->path = preg_replace('#^' . preg_quote($oldPath, '#') . '#', $newPath, $child->path);
            $child->save();
            if ($child->tipoFichero && $child->tipoFichero->nombre === 'Carpeta') {
                $this->updateChildrenPaths($child, $oldPath, $newPath);
            }
        }
    }

    /**
     * Elimina un fichero o carpeta y sus hijos.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $file = File::with([
                'children.children.children.children.children',
                'tipoFichero',
                'parent'
            ])->findOrFail($id);

            $tiposFichero = TipoFichero::all()->keyBy('id');
            $this->deleteChildFiles($file, $tiposFichero);

            $parent = $file->parent;
            if ($parent) {
                $parent->qty_ficheros = File::where('parent_id', $parent->id)->count();
                $parent->save();
            }

            return response()->json(['message' => 'Fichero eliminado correctamente.']);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Ocurrió un error al eliminar el fichero: " . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Elimina recursivamente los hijos de un fichero/carpeta.
     */
    private function deleteChildFiles(File $file, $tiposFichero)
    {
        $file->loadMissing('children');

        foreach ($file->children as $child) {
            $this->deleteChildFiles($child, $tiposFichero);
        }

        $tipo = $tiposFichero[$file->tipo_fichero_id] ?? null;

        if ($tipo && $tipo->nombre === 'Carpeta') {
            $this->storage->deleteDirectory($file->path);
        } else {
            $this->storage->deleteFile($file->path);
        }

        File::withoutEvents(function () use ($file) {
            $file->delete();
        });
    }

    /**
     * Descarga un archivo usando la estrategia de almacenamiento.
     *
     * @param string $hash
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\RedirectResponse
     */
    /* public function download(string $hash)
    {
        // Validar la firma del enlace
        if (!request()->hasValidSignature()) {
            abort(403, 'Enlace no válido o expirado');
        }

        // Obtener el hash desde la firma
        $hash = request()->query('hash', $hash);

        // Buscar el archivo en la base de datos usando el hash
        $file = File::where('hash', $hash)->first();

        if (!$file) {
            abort(404, 'Archivo no encontrado en la base de datos');
        }

        $preview = request()->query('preview') === 'true';

        return $this->storage->downloadFile($file, $preview);
    } */
    public function generateSignedDownloadUrl($hash)
    {
        $file = File::where('hash', $hash)->firstOrFail();
        $url = $this->storage->getSignedDownloadUrl($file);
        return response()->json(['url' => $url]);
    }

    public function downloadLocal($hash)
    {
        $file = File::where('hash', $hash)->firstOrFail();
        $absolutePath = Storage::disk('local')->path($file->path);
        return response()->download($absolutePath);
    }

    public function list(): JsonResponse
    {
        $files = $this->storage->allFiles(); // Puedes pasar un path como argumento
        return response()->json(['files' => $files]);
    }

    public function fileInfo(Request $request): ?array
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        /* $file = File::where('path', $path)->first();
    
        if (!$file) {
            return response()->json(['message' => 'Archivo no encontrado en la base de datos.'], Response::HTTP_NOT_FOUND);
        }
    
        $storageInfo = $this->storage->getFileInfo($path);
    
        if (!$storageInfo) {
            return response()->json(['message' => 'Archivo no encontrado en el bucket S3.'], Response::HTTP_NOT_FOUND);
        }
    
        return response()->json([
            'file' => new \App\Http\Resources\FileResource($file),
            'storage' => $storageInfo,
        ]); */
        return $this->storage->getFileInfo($path);
    }
}
