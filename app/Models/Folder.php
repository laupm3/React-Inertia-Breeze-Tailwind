<?php

namespace App\Models;

use Kalnoy\Nestedset\NodeTrait;
use App\Services\Storage\FolderService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Folder extends Model
{
    use HasFactory, SoftDeletes, NodeTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'created_by',
        'nivel_acceso_id',
        'nivel_seguridad_id',
        'tipo_fichero_id',
        'extension', // Nueva columna directa
        'name',
        'path',
        'hash',
        'size',
        'is_erasable',
        'is_visible',
        'is_sharable',
        'description',
        'fileable_id',
        'fileable_type',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'is_erasable' => 'boolean',
        'is_visible' => 'boolean',
        'is_sharable' => 'boolean',
        'size' => 'integer',
    ];

    /**
     * ID del tipo de fichero para carpetas.
     */
    public const TIPO_CARPETA = 1;
    /**
     * ID del tipo de fichero para archivos.
     */
    public const TIPO_ARCHIVO = 2;

    /**
     * Mapa de extensiones a MIME types
     */
    private static array $mimeTypeMap = [
        // Imágenes
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'bmp' => 'image/bmp',

        // Documentos
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt' => 'text/plain',
        'rtf' => 'application/rtf',
        'odt' => 'application/vnd.oasis.opendocument.text',

        // Hojas de cálculo
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv' => 'text/csv',
        'ods' => 'application/vnd.oasis.opendocument.spreadsheet',

        // Videos
        'mp4' => 'video/mp4',
        'avi' => 'video/x-msvideo',
        'mov' => 'video/quicktime',
        'wmv' => 'video/x-ms-wmv',
        'flv' => 'video/x-flv',
        'webm' => 'video/webm',
        'mkv' => 'video/x-matroska',

        // Audio
        'mp3' => 'audio/mpeg',
        'wav' => 'audio/wav',
        'flac' => 'audio/flac',
        'aac' => 'audio/aac',
        'ogg' => 'audio/ogg',
        'wma' => 'audio/x-ms-wma',
    ];

    /**
     * Determine if the folder is a directory (carpeta).
     * 
     * @return bool
     */
    public function esCarpeta(): bool
    {
        return $this->tipo_fichero_id === self::TIPO_CARPETA;
    }

    /**
     * Determine if the folder is a file (archivo).
     * 
     * @return bool
     */
    public function esArchivo(): bool
    {
        return $this->tipo_fichero_id === self::TIPO_ARCHIVO;
    }

    /**
     * Get the user that owns the folder.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user that created the folder.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the access level of the folder.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nivelAcceso()
    {
        return $this->belongsTo(NivelAcceso::class);
    }

    /**
     * Get the security level of the folder.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function nivelSeguridad()
    {
        return $this->belongsTo(NivelSeguridad::class);
    }

    /**
     * Métodos para manejo de extensiones
     */
    public function getExtensionAttribute($value): ?string
    {
        // Si ya está guardada, devolverla en minúsculas
        if ($value) {
            return strtolower($value);
        }

        // Si es carpeta, no tiene extensión
        if ($this->esCarpeta()) {
            return null;
        }

        // Si es archivo, extraer de nombre
        return $this->name ? strtolower(pathinfo($this->name, PATHINFO_EXTENSION)) : null;
    }

    public function setExtensionAttribute($value): void
    {
        $this->attributes['extension'] = $value ? strtolower(trim($value)) : null;
    }

    /**
     * Obtener la entidad relacionada (polimórfica)
     */
    public function fileable()
    {
        return $this->morphTo();
    }

    /**
     * Scope para filtrar solo carpetas
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     */
    public function scopeCarpetas($query)
    {
        return $query->where('tipo_fichero_id', self::TIPO_CARPETA);
    }

    /**
     * Scope para filtrar solo archivos
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     */
    public function scopeArchivos($query)
    {
        return $query->where('tipo_fichero_id', self::TIPO_ARCHIVO);
    }

    /**
     * Scope para filtrar por extensión de archivo.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $extension
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeConExtension($query, $extension)
    {
        return $query->where('extension_id', $extension);
    }

    /**
     * Scopes para búsquedas eficientes por extensión
     */
    public function scopeWithExtension($query, string|array $extensions)
    {
        $extensions = is_array($extensions) ? $extensions : [$extensions];
        return $query->whereIn('extension', array_map('strtolower', $extensions));
    }

    public function scopeImages($query)
    {
        return $query->withExtension(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
    }

    public function scopeDocuments($query)
    {
        return $query->withExtension(['pdf', 'doc', 'docx', 'txt', 'rtf']);
    }

    public function scopeSpreadsheets($query)
    {
        return $query->withExtension(['xls', 'xlsx', 'csv']);
    }

    public function scopeVideos($query)
    {
        return $query->withExtension(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']);
    }

    public function scopeAudios($query)
    {
        return $query->withExtension(['mp3', 'wav', 'flac', 'aac', 'ogg']);
    }

    /**
     * Obtener el tipo MIME del archivo basado en su extensión.
     */
    public function getMimeType(): ?string
    {
        if (!$this->extension) {
            return null;
        }

        return self::$mimeTypeMap[$this->extension] ?? 'application/octet-stream';
    }

    /**
     * Obtener el breadcrumb completo
     */
    public function getBreadcrumbAttribute()
    {
        return $this->ancestors->prepend($this);
    }

    /**
     * Obtener breadcrumb para usuario (eliminando raíz)
     */
    public function getBreadcrumbForUserAttribute()
    {
        return $this->ancestors->slice(2)->push($this);
    }

    /**
     * Obtener archivos contenidos en esta carpeta
     */
    public function contenidos()
    {
        return $this->children()->with(['tipoFichero']);
    }

    /**
     * Obtener solo las carpetas hijas directas de esta carpeta
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function subcarpetas()
    {
        return $this->children()->carpetas();
    }

    /**
     * Obtener solo los archivos hijos directos de esta carpeta
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function archivos()
    {
        return $this->children()->archivos();
    }

    /**
     * Get the count of files in this folder.
     * 
     * @return int
     */
    public function getFileCountAttribute()
    {
        return $this->archivos()->count();
    }

    /**
     * Get the size format in a human-readable format.
     */
    public function getFormattedSizeAttribute(): string
    {
        $size = $this->size;

        if ($size < 1024) {
            return $size . ' bytes';
        } elseif ($size < 1048576) {
            return round($size / 1024, 2) . ' KB';
        } elseif ($size < 1073741824) {
            return round($size / 1048576, 2) . ' MB';
        }

        return round($size / 1073741824, 2) . ' GB';
    }

    /**
     * Verificar si está adjunto a alguna entidad
     * 
     * @return bool
     */
    public function isAttached(): bool
    {
        return !is_null($this->fileable_type) && !is_null($this->fileable_id);
    }

    /**
     * Attach the folder to an entity (polymorphic relationship).
     * 
     * @param mixed $entity The entity to attach to (e.g., a User, Post, etc.)
     * @param string|null $description Optional description for the attachment.
     * 
     * @return self
     */
    public function attachTo($entity, $description = null): self
    {
        $this->fileable_type = get_class($entity);
        $this->fileable_id = $entity->id;
        $this->description = $description;
        $this->save();

        return $this;
    }

    /**
     * Detach the folder from any entity.
     */
    public function detach(): self
    {
        $this->fileable_type = null;
        $this->fileable_id = null;
        $this->description = null;
        $this->save();

        return $this;
    }

    /**
     * Crea una estructura de carpetas completa a partir de una ruta.
     * 
     * @deprecated Use FolderService::createPath() instead
     * @param string $path Ruta completa a crear (formato: "folder1/folder2/folder3")
     * @param array $attributes Atributos adicionales para aplicar a las carpetas creadas
     * @param int|null $userId ID del usuario propietario (por defecto, usuario autenticado)
     * @return Folder La última carpeta creada o encontrada
     */
    public static function createPath(string $path, array $attributes = [], ?int $userId = null): Folder
    {
        return app(FolderService::class)->createPath($path, $attributes, $userId);
    }

    /**
     * Crea o encuentra una carpeta con el nombre especificado dentro de esta carpeta
     *
     * @deprecated Use FolderService::createSubfolder() instead
     * @param string $folderName Nombre de la carpeta a crear
     * @param array $attributes Atributos adicionales
     * @return Folder
     */
    public function createSubfolder(string $folderName, array $attributes = []): Folder
    {
        return app(FolderService::class)->createSubfolder($this, $folderName, $attributes);
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'hash';
    }

    /**
     * Check if the folder is a static file.
     * 
     * @return bool
     */
    public function isFileStatic(): bool
    {
        // Si es carpeta, no puede ser estática
        if ($this->esCarpeta()) {
            return false;
        }

        // Si no tiene extensión, no puede ser estática
        if (!$this->extension) {
            return false;
        }

        // Verificar si la extensión es de archivo estático
        return in_array($this->extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
    }

    /** 
     * Determina el Content-Disposition para este archivo o carpeta.
     * 
     * @return string Content-Disposition header value
     */
    public function getContentDisposition(): string
    {
        if ($this->esCarpeta()) {
            // Las carpetas no tienen Content-Disposition
            return '';
        }

        // Archivos que se pueden mostrar inline
        $inlineTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'text/plain',
            'text/html',
            'text/css',
            'application/json'
        ];

        $mimeType = $this->getMimeType();

        if (in_array($mimeType, $inlineTypes)) {
            return 'inline; filename="' . $this->name . '"';
        }

        // ✅ Por defecto: forzar descarga
        return 'attachment; filename="' . $this->name . '"';
    }

    public function isDocumentFile(): bool
    {
        return in_array($this->extension, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);
    }
}
