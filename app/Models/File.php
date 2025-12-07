<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class File extends Model
{
    /** @use HasFactory<\Database\Factories\FileFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'files';

    protected $fillable = [
        'user_id',
        'created_by',
        'nivel_acceso_id',
        'tipo_fichero_id',
        'nivel_seguridad_id',
        'parent_id',
        'extension_id',
        'hash',
        'nombre',
        'path',
        'size',
        'qty_ficheros',
        'is_erasable',
        'is_visible',
        'is_sharable',
        // Nuevos campos para funcionalidad fileable
        'fileable_id',
        'fileable_type',
        'description'
    ];

    protected $casts = [
        'is_erasable' => 'boolean',
        'is_visible' => 'boolean',
        'is_sharable' => 'boolean',
        'size' => 'integer',
        'qty_ficheros' => 'integer',
    ];

    /**
     * The filesystem disk that should be used to store the file.
     */
    //public const DISK = 's3';
    public const DISK = 'hr';

    /**
     * Get the empleado that owns the File
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    /**
     * Get the tipo that owns the File
     */
    public function tipoFichero()
    {
        return $this->belongsTo(TipoFichero::class);
    }

    /**
     * Get the nivel of security that owns the File
     */
    public function nivelSeguridad()
    {
        return $this->belongsTo(NivelSeguridad::class);
    }

    /**
     * Get the parent folder that owns the File
     */
    public function parent()
    {
        return $this->belongsTo(File::class, 'parent_id');
    }

    /**
     * Get the extension of the File
     */
    public function extensionFichero()
    {
        return $this->belongsTo(ExtensionFichero::class);
    }

    /**
     * Obtiene el nivel de acceso del file
     */
    public function nivelAcceso()
    {
        return $this->belongsTo(NivelAcceso::class, 'nivel_acceso_id');
    }

    /**
     * Get the children of the folder
     */
    public function children()
    {
        return $this->hasMany(File::class, 'parent_id');
    }

    /**
     * Get the entity that owns this file (relación polimórfica)
     */
    public function fileable()
    {
        return $this->morphTo();
    }

    /**
     * Boot the model.
     */
    public static function boot()
    {
        parent::boot();

        static::created(function ($file) {
            $file->updateParentQtyFiles();
        });

        static::deleted(function ($file) {
            $file->updateParentQtyFiles();
        });
    }

    public function updateParentQtyFiles()
    {
        if ($this->parent_id) {
            $parent = self::find($this->parent_id);
            $parent->qty_ficheros = self::where('parent_id', $this->parent_id)->count();
            $parent->save();
        }
    }

    /**
     * Get the breadcrumb path for an employee - Means not including the root and the user folder
     *
     * @return \Illuminate\Support\Collection<File>
     */
    public function getBreadcrumbForUser(): \Illuminate\Support\Collection
    {
        return $this->buildBreadcrumb($this)->slice(2)->values();
    }

    /**
     * Build the breadcrumb for a file
     *
     * @param File $file
     * @return \Illuminate\Support\Collection<File>
     */
    private function buildBreadcrumb(File $file): \Illuminate\Support\Collection
    {
        $breadcrumbs = collect([$file]);

        while ($file->parent) {
            $breadcrumbs->prepend($file->parent);
            $file = $file->parent;
        }

        return $breadcrumbs;
    }

    /**
     * Get the creator of the file
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that owns the File
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para filtrar archivos por tipo de entidad relacionada
     */
    public function scopeForEntityType($query, $entityType)
    {
        return $query->where('fileable_type', $entityType);
    }

    /**
     * Scope para filtrar archivos por entidad específica
     */
    public function scopeForEntity($query, $entityType, $entityId)
    {
        return $query->where('fileable_type', $entityType)
            ->where('fileable_id', $entityId);
    }

    /**
     * Scope para filtrar solo archivos de nóminas
     */
    public function scopeForNominas($query)
    {
        $archivoTypeId = \App\Models\TipoFichero::where('nombre', 'Archivo')->first()?->id;

        return $query->where('tipo_fichero_id', $archivoTypeId)
            ->where(function ($query) {
                $query->where('path', 'like', '%/Nominas/%')
                    ->orWhere(function ($query) {
                        $query->where('nombre', 'like', 'Nomina_%');

                        // Si estamos en SQLite (como en testing), usamos un enfoque diferente
                        if (DB::connection()->getDriverName() === 'sqlite') {
                            // Usamos LIKE en lugar de REGEXP para SQLite
                            $query->where('nombre', 'like', '%\_20__\_%');
                        } else {
                            // Para MySQL y otros motores que soportan REGEXP
                            $query->whereRaw("nombre REGEXP '_[0-9]{4}_'");
                        }
                    });
            });
    }

    /**
     * Verificar si el archivo está asociado a alguna entidad
     */
    public function isAttached(): bool
    {
        return !is_null($this->fileable_type) && !is_null($this->fileable_id);
    }

    /**
     * Adjuntar este archivo a una entidad
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
     * Desasociar este archivo de cualquier entidad
     */
    public function detach(): self
    {
        $this->fileable_type = null;
        $this->fileable_id = null;
        $this->description = null;
        $this->save();

        return $this;
    }
}
