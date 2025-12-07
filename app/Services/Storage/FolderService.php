<?php

namespace App\Services\Storage;

use App\Models\Folder;
use App\Models\NivelAcceso;
use App\Models\NivelSeguridad;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Servicio para gestionar carpetas y su estructura jerárquica.
 * 
 * Este servicio permite crear, mover, eliminar y explorar carpetas,
 * así como gestionar sus relaciones jerárquicas utilizando la estructura NestedSet.
 * 
 * Además, proporciona funcionalidades para crear rutas completas de carpetas,
 * buscar contenidos y obtener listados de archivos y carpetas.
 * 
 * @package App\Services
 * @author TeDeLimon
 */
class FolderService
{
    /**
     * Crea una estructura de carpetas completa a partir de una ruta.
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     * 
     * Este método crea todas las carpetas intermedias necesarias para una ruta dada,
     * aprovechando la estructura NestedSet para establecer las relaciones jerárquicas correctas.
     * Las carpetas existentes serán reutilizadas.
     * 
     * @param string $path Ruta completa a crear (formato: "folder1/folder2/folder3")
     * @param array $attributes Atributos adicionales para aplicar a las carpetas creadas
     * @param int|\App\Models\User|null $owner Propietario de las carpetas
     * @param int|\App\Models\User|null $creator Usuario que crea las carpetas (si es distinto del autenticado)
     * @return Folder La última carpeta creada o encontrada
     * 
     * @throws \InvalidArgumentException Si la ruta está vacía o es inválida
     * @throws \Exception Si ocurre un problema durante la creación
     */
    public function createPath(
        string $path,
        array $attributes = [],
        ?User $owner = null,
        ?User $creator = null
    ): Folder {
        // Validaciones iniciales (igual)
        if (empty($path)) {
            throw new \InvalidArgumentException('La ruta no puede estar vacía');
        }

        // Preparar segmentos de la ruta
        $segments = collect(explode('/', trim($path, '/')))->filter();

        if ($segments->isEmpty()) {
            throw new \InvalidArgumentException('La ruta no contiene segmentos válidos');
        }

        $ownerId = $this->determineUserId($owner);
        $creatorId = $this->determineUserId($creator);

        // Calcular todas las rutas posibles que necesitaremos
        $possiblePaths = collect();
        $currentPath = '';
        foreach ($segments as $segment) {
            $currentPath .= '/' . $segment;
            $possiblePaths->push(ltrim($currentPath, '/'));
        }

        // Cargar todas las carpetas existentes de una sola vez (1 única consulta)
        $existingFolders = Folder::whereIn('path', $possiblePaths)->get()->keyBy('path');

        $current = null;
        $currentPath = '';

        foreach ($segments as $segment) {
            // Construir ruta acumulativa
            $currentPath .= '/' . $segment;
            $currentPath = ltrim($currentPath, '/');

            // Buscar en la colección de carpetas existentes en lugar de en la base de datos
            $folder = $existingFolders->get($currentPath);

            if (!$folder) {
                // Preparar datos de la carpeta
                $folderData = [
                    'name' => $segment,
                    'path' => $currentPath,
                    'hash' => Str::uuid(),
                    'tipo_fichero_id' => Folder::TIPO_CARPETA,
                    'user_id' => $ownerId,
                    'created_by' => $creatorId,
                    'size' => 0,
                    'is_visible' => true,
                    'nivel_acceso_id' => $attributes['nivel_acceso_id'] ?? NivelAcceso::PUBLICO,
                    'nivel_seguridad_id' => $attributes['nivel_seguridad_id'] ?? NivelSeguridad::L1,
                    ...$attributes
                ];

                /** @var \App\Models\Folder $folder */
                $folder = Folder::create($folderData);

                // Guardar con la relación jerárquica correcta
                if ($current) {
                    $folder->appendToNode($current)->save();
                } else {
                    $folder->saveAsRoot();
                }

                // Añadir a nuestra colección para el siguiente ciclo
                $existingFolders->put($currentPath, $folder);
            }

            $current = $folder;
        }

        return $current;
    }

    /**
     * Crea o encuentra una estructura de carpetas dentro de una carpeta padre
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     *
     * @param Folder $parentFolder La carpeta donde crear las subcarpetas
     * @param string $subPath Ruta de subcarpetas a crear (formato: "folder1/folder2/folder3")
     * @param array $attributes Atributos adicionales
     * @param User|null $creator Usuario que crea las subcarpetas (por defecto el usuario autenticado)
     * @return Folder La última carpeta creada o encontrada
     * @throws \InvalidArgumentException Si la carpeta padre no es de tipo carpeta
     * @throws \Exception Si ocurre un problema durante la creación
     */
    public function createSubfolder(
        Folder $parentFolder,
        string $subPath,
        array $attributes = [],
        ?User $creator = null
    ): Folder {
        if (!$parentFolder->esCarpeta()) {
            throw new \InvalidArgumentException('El padre debe ser una carpeta');
        }

        // Validar la ruta
        if (empty($subPath)) {
            throw new \InvalidArgumentException('La ruta de la subcarpeta no puede estar vacía');
        }

        // Si es solo un nombre de carpeta sin '/', usar la lógica existente optimizada
        if (strpos($subPath, '/') === false) {
            return $this->createSingleSubfolder($parentFolder, $subPath, $attributes, $creator);
        }

        // Para rutas múltiples, construir la ruta completa y usar createPath
        $fullPath = rtrim($parentFolder->path, '/') . '/' . ltrim($subPath, '/');

        // Determinar atributos predeterminados heredados
        $mergedAttributes = [
            'user_id' => $parentFolder->user_id,
            'nivel_acceso_id' => $parentFolder->nivel_acceso_id,
            'nivel_seguridad_id' => $parentFolder->nivel_seguridad_id,
            ...$attributes
        ];

        // Usar createPath que ya maneja la creación de múltiples niveles
        return $this->createPath($fullPath, $mergedAttributes, null, $creator);
    }

    /**
     * Crea o encuentra una subcarpeta individual dentro de una carpeta padre
     * 
     * Este método está optimizado para crear una sola carpeta sin procesar toda la ruta.
     *
     * @param Folder $parentFolder La carpeta donde crear la subcarpeta
     * @param string $folderName Nombre de la carpeta a crear
     * @param array $attributes Atributos adicionales
     * @param User|null $creator Usuario que crea la subcarpeta (por defecto el usuario autenticado)
     * @return Folder
     * @throws \InvalidArgumentException Si el nombre de la carpeta contiene caracteres inválidos
     */
    protected function createSingleSubfolder(
        Folder $parentFolder,
        string $folderName,
        array $attributes = [],
        ?User $creator = null
    ): Folder {
        // Validar el nombre de la carpeta
        if (empty($folderName)) {
            throw new \InvalidArgumentException('El nombre de la carpeta no puede estar vacío');
        }

        // Construir la ruta completa
        $path = $parentFolder->path . '/' . $folderName;

        // Comprobar si la carpeta ya existe (optimización para evitar entrar en createPath si no es necesario)
        $existingFolder = Folder::where('path', $path)->first();
        if ($existingFolder) {
            return $existingFolder;
        }

        // Determinar el creador
        $creatorId = $this->determineUserId($creator);

        // Heredar atributos del padre si no se especifican
        $mergedAttributes = [
            'user_id' => $attributes['user_id'] ?? $parentFolder->user_id,
            'nivel_acceso_id' => $attributes['nivel_acceso_id'] ?? $parentFolder->nivel_acceso_id,
            'nivel_seguridad_id' => $attributes['nivel_seguridad_id'] ?? $parentFolder->nivel_seguridad_id,
            ...$attributes,
        ];

        // Crear la carpeta directamente sin procesar toda la ruta
        $folderData = [
            'name' => $folderName,
            'path' => $path,
            'hash' => Str::uuid(),
            'tipo_fichero_id' => Folder::TIPO_CARPETA,
            'size' => 0,
            'is_visible' => true,
            'created_by' => $creatorId,
            ...$mergedAttributes
        ];

        // Crear la carpeta
        $folder = Folder::create($folderData);

        // Establecer la relación jerárquica
        $folder->appendToNode($parentFolder)->save();

        return $folder;
    }

    /**
     * Mueve una carpeta a otra ubicación en el árbol
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     *
     * @param Folder $folder La carpeta a mover
     * @param Folder $targetFolder La carpeta destino
     * @param bool $overwrite Si es true, sobrescribe cualquier carpeta existente con el mismo nombre
     * @return Folder La carpeta movida
     * @throws \InvalidArgumentException Si alguno de los nodos no es una carpeta o hay conflictos
     * @throws \Exception Si ocurre un problema durante el movimiento
     */
    public function moveFolder(Folder $folder, Folder $targetFolder, bool $overwrite = false): Folder
    {
        // Validaciones
        if (!$folder->esCarpeta() || !$targetFolder->esCarpeta()) {
            throw new \InvalidArgumentException('Tanto origen como destino deben ser carpetas');
        }

        if ($folder->isAncestorOf($targetFolder)) {
            throw new \InvalidArgumentException('No se puede mover una carpeta dentro de sí misma o sus descendientes');
        }

        // Obtener la ruta antigua
        $oldPath = $folder->path;
        $folderName = basename($oldPath);

        // Generar la nueva ruta
        $newPath = rtrim($targetFolder->path, '/') . '/' . $folderName;

        // Verificar si existe una carpeta con el mismo nombre en el destino
        $existingFolder = Folder::where('path', $newPath)->first();
        if ($existingFolder && !$overwrite) {
            throw new \InvalidArgumentException(
                "Ya existe una carpeta llamada '{$folderName}' en el destino. " .
                    "Usa el parámetro 'overwrite' para reemplazarla."
            );
        }

        // Eliminar la carpeta existente si se especificó overwrite
        if ($existingFolder && $overwrite) {
            $this->deleteFolder($existingFolder);
        }

        // Optimización: obtener todos los descendientes primero
        $descendants = $folder->descendants()->get();

        // Actualizar jerarquía en el árbol y la ruta de la carpeta principal
        $folder->appendToNode($targetFolder)->save();
        $folder->path = $newPath;
        $folder->save();

        // Actualizar rutas de todos los descendientes de manera más eficiente
        if ($descendants->isNotEmpty()) {
            // Calculamos el prefijo común a reemplazar en todos los descendientes
            foreach ($descendants as $descendant) {
                // Reemplazar la parte inicial de la ruta de manera eficiente
                $descendant->path = preg_replace(
                    pattern: '/^' . preg_quote($oldPath, '/') . '\//',
                    replacement: $newPath . '/',
                    subject: $descendant->path
                );
                $descendant->save();
            }
        }

        return $folder;
    }

    /**
     * Elimina una carpeta y todos sus descendientes
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     *
     * @param Folder $folder La carpeta a eliminar
     * @param bool $forceDelete Si es true, realiza un borrado permanente (sin papelera)
     * @return bool
     * @throws \InvalidArgumentException Si el nodo no es una carpeta
     * @throws \Exception Si ocurre un problema durante la eliminación
     */
    public function deleteFolder(Folder $folder, bool $forceDelete = false): bool
    {
        // Obtener todos los descendientes antes de eliminar (para posibles operaciones adicionales)
        $descendants = $this->getDescendants($folder);

        // Si hay que registrar alguna operación sobre los descendientes, podríamos hacerlo aquí
        // Por ejemplo: registrar los IDs eliminados para un trabajo en cola que limpie archivos físicos

        // Usar el método de eliminación NestedSet que elimina todo el subárbol
        if ($forceDelete) {
            // Borrado permanente sin papelera
            $folder->forceDelete();

            // También podríamos forzar el borrado permanente de los descendientes si es necesario
            if ($descendants->isNotEmpty()) {
                foreach ($descendants as $descendant) {
                    $descendant->forceDelete();
                }
            }
        } else {
            // Borrado normal (soft delete)
            $folder->delete();
            // No es necesario borrar explícitamente los descendientes, 
            // el borrado en cascada está manejado por NestedSet
        }

        return true;
    }

    /**
     * Obtiene todos los descendientes de una carpeta
     * 
     * @param Folder $folder La carpeta de la que obtener los descendientes
     * @return \Illuminate\Database\Eloquent\Collection<Folder> Colección de descendientes
     * @throws \InvalidArgumentException Si el nodo no es una carpeta
     */
    public function getDescendants(Folder $folder): \Illuminate\Database\Eloquent\Collection
    {
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El nodo debe ser una carpeta');
        }

        // Obtener todos los descendientes de la carpeta
        return $folder->descendants()->get();
    }

    /**
     * Obtiene la ruta relativa de una carpeta o archivo desde una carpeta base
     * 
     * Este método calcula la ruta relativa de una carpeta o archivo
     * respecto a una carpeta base dada. Es útil para generar rutas relativas
     * en sistemas de archivos o para propósitos de visualización.
     * 
     * @param Folder $folder La carpeta o archivo del cual obtener la ruta relativa
     * @param Folder $baseFolder La carpeta base desde la cual calcular la ruta relativa
     * @return string Ruta relativa desde la carpeta base
     * @throws \InvalidArgumentException Si alguno de los nodos no es una carpeta
     * @throws \InvalidArgumentException Si la carpeta base no es un ancestro de la carpeta solicitada
     */
    public function getRelativePathFromBase(Folder $folder, Folder $baseFolder): string
    {
        if (!$baseFolder->esCarpeta()) {
            throw new \InvalidArgumentException('La carpeta base debe ser una carpeta');
        }

        // Asegurarse de que la carpeta base es un ancestro del folder
        if (!$folder->isDescendantOf($baseFolder)) {
            throw new \InvalidArgumentException('La carpeta base no es un ancestro de la carpeta o archivo solicitado');
        }

        // Obtener la ruta relativa eliminando el prefijo de la carpeta base
        return str_replace($baseFolder->path . '/', '', $folder->path);
    }

    /**
     * Obtiene el listado de contenidos de una carpeta con opciones avanzadas de filtrado y ordenamiento
     *
     * @param Folder $folder La carpeta a explorar
     * @param array $options Opciones de filtrado y ordenamiento
     * @return array Contenidos separados en carpetas, archivos y total
     * @throws \InvalidArgumentException Si el nodo no es una carpeta
     */
    public function getFolderContents(Folder $folder, array $options = []): array
    {
        if (!$folder->esCarpeta()) {
            throw new \InvalidArgumentException('El nodo debe ser una carpeta');
        }

        // Configuración por defecto
        $defaults = [
            'show_hidden' => false,
            'sort_by' => 'nombre',
            'sort_direction' => 'asc',
            'filter_type' => null,
            'search' => null,
            'nivel_acceso_id' => null,
            'nivel_seguridad_id' => null,
            'extension' => null,
            'user_id' => null,
            'created_by' => null,
            'page' => 1,
            'per_page' => null,
        ];

        $options = [...$defaults, ...$options];

        // Consulta base para los hijos directos
        $query = $folder->children();

        // Filtrar según visibilidad
        if (!$options['show_hidden']) {
            $query->where('is_visible', true);
        }

        // Filtrar por tipo
        if ($options['filter_type'] === 'folders') {
            $query->carpetas();
        } elseif ($options['filter_type'] === 'files') {
            $query->archivos();
        }

        // Filtrar por búsqueda
        if ($options['search']) {
            $query->where(function ($q) use ($options) {
                $term = '%' . $options['search'] . '%';
                $q->where('name', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('path', 'like', $term);
            });
        }

        // Filtrar por nivel de acceso
        if ($options['nivel_acceso_id']) {
            $query->where('nivel_acceso_id', $options['nivel_acceso_id']);
        }

        // Filtrar por nivel de seguridad
        if ($options['nivel_seguridad_id']) {
            $query->where('nivel_seguridad_id', $options['nivel_seguridad_id']);
        }

        // Filtrar por extensión (para archivos)
        if ($options['extension']) {
            $query->where('extension', $options['extension']);
        }

        // Filtrar por propietario
        if ($options['user_id']) {
            $query->where('user_id', $options['user_id']);
        }

        // Filtrar por creador
        if ($options['created_by']) {
            $query->where('created_by', $options['created_by']);
        }

        // Ordenar resultados
        $query->orderBy($options['sort_by'], $options['sort_direction']);

        // Si se solicita paginación
        if ($options['per_page']) {
            $paginator = $query->paginate($options['per_page'], ['*'], 'page', $options['page']);
            $contents = $paginator->items();

            return [
                'folders' => collect($contents)->filter->esCarpeta()->values(),
                'files' => collect($contents)->filter->esArchivo()->values(),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
            ];
        }

        // Sin paginación (obtener todos los resultados)
        $contents = $query->get();

        return [
            'folders' => $contents->filter->esCarpeta()->values(),
            'files' => $contents->filter->esArchivo()->values(),
            'total' => $contents->count(),
        ];
    }

    /**
     * Busca archivos y carpetas por nombre o contenido
     *
     * @param string $term Término de búsqueda
     * @param Folder|null $folder Carpeta donde buscar (null para buscar en todo el sistema)
     * @param array $options Opciones adicionales de búsqueda
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function search(string $term, ?Folder $folder = null, array $options = [])
    {
        $defaults = [
            'tipo_fichero_id' => null,
            'nivel_acceso_id' => null,
            'extension' => null,
            'user_id' => null,
            'show_hidden' => false,
            'limit' => 50,
        ];

        $options = array_merge($defaults, $options);

        // Consulta base
        $query = Folder::query();

        // Filtrar por carpeta si se especifica
        if ($folder) {
            if ($folder->esCarpeta()) {
                // Buscar solo dentro de esta carpeta y sus descendientes
                $query->where(function ($q) use ($folder) {
                    $q->where('id', $folder->id)
                        ->orWhere(function ($sq) use ($folder) {
                            $sq->where('_lft', '>', $folder->_lft)
                                ->where('_rgt', '<', $folder->_rgt);
                        });
                });
            } else {
                throw new \InvalidArgumentException('El nodo debe ser una carpeta');
            }
        }

        // Aplicar término de búsqueda
        $query->where(function ($q) use ($term) {
            $q->where('name', 'like', '%' . $term . '%')
                ->orWhere('description', 'like', '%' . $term . '%')
                ->orWhere('path', 'like', '%' . $term . '%');
        });

        // Aplicar filtros adicionales
        if ($options['tipo_fichero_id']) {
            $query->where('tipo_fichero_id', $options['tipo_fichero_id']);
        }

        if ($options['nivel_acceso_id']) {
            $query->where('nivel_acceso_id', $options['nivel_acceso_id']);
        }

        if ($options['extension']) {
            $query->where('extension', $options['extension']);
        }

        if ($options['user_id']) {
            $query->where('user_id', $options['user_id']);
        }

        if (!$options['show_hidden']) {
            $query->where('is_visible', true);
        }

        // Limitar resultados
        $query->limit($options['limit']);

        return $query->get();
    }

    /**
     * Obtiene el usuario Super Admin del sistema
     * Utiliza caché para evitar consultas repetidas a la base de datos
     *
     * @return \App\Models\User
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no se encuentra un Super Admin
     */
    protected function getSuperAdmin(): \App\Models\User
    {
        return Cache::remember(
            key: 'super_admin_user',
            ttl: 60 * 60 * 24, // 24 horas
            callback: fn() => User::role('Super Admin')->firstOrFail()
        );
    }

    /**
     * Determina el ID de un usuario basado en diferentes inputs posibles
     *
     * @param mixed $user Usuario (ID numérico o instancia de User) o null
     * @return int ID del usuario 
     */
    protected function determineUserId($user = null): int
    {
        // Si es una instancia de User, devolver su ID
        if ($user instanceof User) {
            return $user->id;
        }

        // Si es un valor numérico (incluyendo 0), devolver como entero
        if (is_numeric($user)) {
            return (int) $user;
        }

        // Como último recurso, usar el usuario autenticado o el Super Admin
        return Auth::id() ?? $this->getSuperAdmin()->id;
    }

    /**
     * Crea un nuevo registro de archivo en la estructura de carpetas
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     * 
     * Este método solo se ocupa de crear el registro lógico en la base de datos,
     * NO del almacenamiento físico ni del procesamiento posterior.
     * 
     * @param Folder $parentFolder Carpeta donde se creará el archivo
     * @param string $fileName Nombre del archivo
     * @param array $attributes Atributos del archivo
     * @param User|int|null $creator Usuario que crea el archivo
     * 
     * @return Folder El modelo Folder correspondiente al archivo creado
     * @throws \InvalidArgumentException Si la carpeta padre no es válida
     */
    public function createFile(
        Folder $parentFolder,
        string $fileName,
        array $attributes = [],
        $creator = null,
        bool $overwrite = false
    ): Folder {
        // Validar que la carpeta padre sea una carpeta
        if (!$parentFolder->esCarpeta()) {
            throw new \InvalidArgumentException('La carpeta padre debe ser de tipo carpeta');
        }

        // Sanear el nombre del archivo
        $safeName = $this->sanitizeFileName($fileName);
        // Construir la ruta completa
        $path = rtrim($parentFolder->path, '/') . '/' . $safeName;

        // Verificar si ya existe un archivo con ese nombre
        $existingFile = Folder::where('path', $path)->first();
        if ($existingFile && !$overwrite) {
            throw new \InvalidArgumentException(
                "Ya existe un archivo llamado '{$safeName}' en la carpeta destino. " .
                    "Usa el parámetro 'overwrite' para reemplazarlo."
            );
        }

        // Si existe y queremos sobrescribir, eliminarlo
        if ($existingFile && $overwrite) {
            $existingFile->delete();
        }

        // Determinar creador
        $creatorId = $this->determineUserId($creator);

        // Preparar datos básicos del archivo heredando propiedades de seguridad de la carpeta padre
        $fileData = [
            'name' => $safeName,
            'path' => $path,
            'hash' => Str::uuid(),
            'tipo_fichero_id' => Folder::TIPO_ARCHIVO,
            'parent_id' => $parentFolder->id,
            'size' => $attributes['size'] ?? 0,
            'extension' => strtolower(pathinfo($safeName, PATHINFO_EXTENSION)) ?: null,
            'created_by' => $creatorId,
            'user_id' => $attributes['user_id'] ?? $parentFolder->user_id,
            'nivel_acceso_id' => $attributes['nivel_acceso_id'] ?? $parentFolder->nivel_acceso_id,
            'nivel_seguridad_id' => $attributes['nivel_seguridad_id'] ?? $parentFolder->nivel_seguridad_id,
            'is_visible' => $attributes['is_visible'] ?? true,
            'description' => $attributes['description'] ?? '',
        ];

        // Crear el modelo de archivo
        $fileModel = Folder::create($fileData);

        // Establecer la relación jerárquica con la carpeta padre
        $fileModel->appendToNode($parentFolder)->save();

        return $fileModel;
    }

    /**
     * Sanitiza un nombre de archivo para evitar problemas de seguridad y compatibilidad
     * 
     * @param string $fileName Nombre de archivo original
     * @return string Nombre de archivo sanitizado
     */
    protected function sanitizeFileName(string $fileName): string
    {
        // Limpiar el nombre eliminando todos los caracteres especiales menos los puntos
        $cleanFileName = preg_replace('/[^\p{L}\p{N}\s\-_\.]/u', '', $fileName);

        // Separar nombre y extensión
        $extension = pathinfo($cleanFileName, PATHINFO_EXTENSION);
        $name = pathinfo($cleanFileName, PATHINFO_FILENAME);

        // Limpiar el nombre eliminando todos los caracteres especiales
        $name = preg_replace('/[^\p{L}\p{N}\s\-_\.]/u', '', $name);

        // Normalizar espacios
        $name = preg_replace('/\s+/', ' ', trim($name));

        // Si está vacío después de limpieza
        if (empty($name)) {
            $name = 'file_' . time();
        }

        // Reconstruir el nombre con extensión
        return "$name.$extension";
    }

    /**
     * Elimina un archivo del sistema
     * 
     * IMPORTANTE: Este método NO maneja transacciones. Las transacciones deben 
     * ser manejadas por el orquestador (DirectoryManagementService).
     *
     * @param Folder $file El archivo a eliminar
     * @param bool $forceDelete Si es true, realiza un borrado permanente (sin papelera)
     * @return bool
     * @throws \InvalidArgumentException Si el nodo no es un archivo
     * @throws \Exception Si ocurre un problema durante la eliminación
     */
    public function deleteFile(Folder $file, bool $forceDelete = false): bool
    {
        if (!$file->esArchivo()) {
            throw new \InvalidArgumentException('El nodo a eliminar debe ser un archivo');
        }

        // Usar el método de eliminación apropiado según el tipo
        if ($forceDelete) {
            // Borrado permanente sin papelera
            $file->forceDelete();
        } else {
            // Borrado normal (soft delete)
            $file->delete();
        }

        return true;
    }
}
