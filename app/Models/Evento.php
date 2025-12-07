<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class Evento extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'eventos';

    /**
     * Relaciones que siempre se deben cargar
     */
    protected $with = ['tipoEvento'];

    /**
     * Relaciones que se pueden cargar por defecto si se necesitan
     */
    protected $withCount = ['users'];

    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'tipo_evento_id',
        'created_by',
        'team_id',
        'departamento_id'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    /**
     * Get the type of event.
     */
    public function tipoEvento()
    {
        return $this->belongsTo(TipoEvento::class);
    }

    /**
     * The user that created the event.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The users that are participating in the event.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'evento_user')
            ->withTimestamps();
    }

    /**
     * The team associated with the event.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * The department associated with the event.
     */
    public function departamento()
    {
        return $this->belongsTo(Departamento::class);
    }

    /**
     * Scope para eventos vigentes
     */
    public function scopeVigentes($query)
    {
        return $query->where('fecha_inicio', '>=', now());
    }

    /**
     * Scope para eventos por tipo
     */
    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_evento_id', $tipoId);
    }

    /**
     * Scope para cargar todas las relaciones necesarias
     */
    public function scopeWithFullRelations($query)
    {
        return $query->with([
            'tipoEvento',
            'createdBy',
            'team',
            'departamento',
            'users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email');
            }
        ]);
    }
    
    /**
     * Scope para eventos visibles para un usuario
     */
    public function scopeVisibleToUser($query, User $user)
    {
        return $query->where(function ($query) use ($user) {
            // Eventos donde es participante
            $query->whereExists(function ($query) use ($user) {
                $query->select(DB::raw(1))
                    ->from('evento_user')
                    ->whereColumn('evento_user.evento_id', 'eventos.id')
                    ->where('evento_user.user_id', $user->id);
            });

            // Eventos de sus equipos
            if ($user->allTeams()->isNotEmpty()) {
                $query->orWhereIn('team_id', $user->allTeams()->pluck('id'));
            }

            // Eventos de su departamento
            if ($user->empleado?->departamentos?->isNotEmpty()) {
                $query->orWhereIn('departamento_id', 
                    $user->empleado->departamentos->pluck('id')
                );
            }
        });
    }
}
