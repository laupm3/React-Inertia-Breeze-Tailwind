<?php

namespace App\Models;

use App\Enums\ProjectType;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    /** @use HasFactory<\Database\Factories\ModuleFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'project',
    ];

    protected $casts = [
        'project' => ProjectType::class,
    ];

    protected $table = 'modules';

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class, 'module_id');
    }

    // Relaciones
    public function tipoIncidencia(): HasMany
    {
        return $this->hasMany(TipoIncidencia::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    // Scopes
    public function scopeByProject($query, ProjectType $project)
    {
        return $query->where('project', $project);
    }

    public function scopeRrhh($query)
    {
        return $query->where('project', ProjectType::RRHH);
    }

    public function scopeInventory($query)
    {
        return $query->where('project', ProjectType::INVENTORY);
    }
}
