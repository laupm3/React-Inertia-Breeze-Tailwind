<?php

namespace App\Services;

use App\Models\User;
use App\Models\Evento;
use App\Models\TipoEvento;
use App\Models\Empresa;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class EventService
{
    /**
     * Obtener eventos para un usuario específico
     */
    public function getEventosForUser(User $user): Collection
    {
        try {
            return Evento::with([
                'users:id,name,email', 
                'tipoEvento:id,nombre,color', 
                'team:id,name', 
                'departamento:id,nombre', 
                'createdBy:id,name'
            ])
            ->visibleToUser($user) // Scope del evento
            ->orderBy('fecha_inicio', 'desc')
            ->get();
        } catch (\Exception $e) {
            Log::error('Error en getEventosForUser:', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Verificar si un usuario puede crear un tipo específico de evento
     * TODO: Modificar el verificar los roles a roles que tengan el permiso para realizar tal acción
     */
    public function canCreateEvento(User $user, string $tipo)
    {
        switch ($tipo) {
            case 'Empresa':
                // Acceso para roles administrativos y RRHH
                return $user->hasAnyRole(['Super Admin', 'Administrator', 'Human Resources']);
                
            case 'Departamento':
                // Todos pueden crear eventos de departamento
                //return $user->hasAnyRole(['Super Admin', 'Administrator', 'Developer', 'Human Resources', 'HR Manager']);
                return true;
            case 'Equipo':
                // Acceso directo para roles administrativos y RRHH
                return true;
              /*   if ($user->hasAnyRole(['Super Admin', 'Administrator', 'Human Resources'])) {
                    return true;
                }
                // Para otros usuarios, verificar permisos en equipos
                return $this->getTeamsWithPermissions($user)->isNotEmpty(); */
                
            case 'Personal':
                // Todos pueden crear eventos personales
                return true;
                
            case 'Recursos Humanos':  // Agregamos ambos casos para manejar ambas versiones
                // Solo roles de RRHH y administrativos
                return $user->hasAnyRole(['Super Admin', 'Administrator', 'Human Resources']);
                
            default:
                return false;
        }
    }

    /**
     * Crear un nuevo evento
     */
    public function createEvento(array $data): Evento
    {
        DB::beginTransaction();
        try {
            // Combinar fecha y hora si ambas están presentes
            if (isset($data['fecha_inicio']) && isset($data['hora_inicio'])) {
                $fecha = $data['fecha_inicio'];
                $hora = $data['hora_inicio'];
                $data['fecha_inicio'] = date('Y-m-d H:i:s', strtotime("$fecha $hora"));
            }

            // Remover hora_inicio ya que no es una columna en la base de datos
            unset($data['hora_inicio']);

            // Crear el evento
            $evento = new Evento($data);
            $evento->created_by = Auth::id();
            $evento->save();

            // Colección de usuarios a agregar
            $usersToAdd = collect();

            // Agregar usuarios específicos del array 'users'
            if (!empty($data['users'])) {
                $usersToAdd = $usersToAdd->concat($data['users']);
            }

            // Si es evento de departamento, agregar usuarios del departamento
            if (!empty($data['departamento_id'])) {
                $usuariosDepartamento = User::whereHas('empleado.departamentos', function($query) use ($data) {
                    $query->where('departamentos.id', $data['departamento_id']);
                })->pluck('users.id');
                $usersToAdd = $usersToAdd->concat($usuariosDepartamento);
            }

            // Si es evento de equipo, agregar miembros del equipo
            if (!empty($data['team_id'])) {
                $usuariosEquipo = Team::find($data['team_id'])
                    ->users()
                    ->select('users.id')
                    ->pluck('users.id');
                $usersToAdd = $usersToAdd->concat($usuariosEquipo);
            }

            // Asegurarse de que el creador siempre sea participante
            $usersToAdd->push(Auth::id());
            
            // Eliminar duplicados y agregar usuarios al evento
            $evento->users()->attach($usersToAdd->unique()->values()->all());

            DB::commit();
            return $evento->load(['users', 'tipoEvento', 'team', 'departamento', 'createdBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar un evento existente
     * 
     * @param Evento $evento
     * @param array $data
     * @return Evento
     */
    public function updateEvento(Evento $evento, array $data): Evento
    {
        DB::beginTransaction();
        try {
            // Combinar fecha y hora si ambas están presentes
            if (isset($data['fecha_inicio']) && isset($data['hora_inicio'])) {
                $fecha = $data['fecha_inicio'];
                $hora = $data['hora_inicio'];
                $data['fecha_inicio'] = date('Y-m-d H:i:s', strtotime("$fecha $hora"));
            }

            // Remover hora_inicio ya que no es una columna en la base de datos
            unset($data['hora_inicio']);

            // Actualizar datos básicos del evento
            $evento->update($data);

            // Colección de usuarios a agregar
            $usersToAdd = collect();

            // Agregar usuarios específicos del array 'users'
            if (!empty($data['users'])) {
                $usersToAdd = $usersToAdd->concat($data['users']);
            }

            // Si es evento de departamento, agregar usuarios del departamento
            if (!empty($data['departamento_id'])) {
                $usuariosDepartamento = User::whereHas('empleado.departamentos', function($query) use ($data) {
                    $query->where('departamentos.id', $data['departamento_id']);
                })->pluck('users.id');
                $usersToAdd = $usersToAdd->concat($usuariosDepartamento);
            }

            // Si es evento de equipo, agregar miembros del equipo
            if (!empty($data['team_id'])) {
                $usuariosEquipo = Team::find($data['team_id'])
                    ->users()
                    ->select('users.id')
                    ->pluck('users.id');
                $usersToAdd = $usersToAdd->concat($usuariosEquipo);
            }

            // Asegurarse de que el creador siempre sea participante
            $usersToAdd->push($evento->created_by);
            
            // Sincronizar usuarios (esto eliminará los que no estén en la lista y agregará los nuevos)
            $evento->users()->sync($usersToAdd->unique()->values()->all());

            DB::commit();
            return $evento->load(['users', 'tipoEvento', 'team', 'departamento', 'createdBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar evento:', [
                'error' => $e->getMessage(),
                'data' => $data,
                'evento_id' => $evento->id
            ]);
            throw $e;
        }
    }

    /**
     * Eliminar un participante de un evento
     */
    public function removeParticipant(Evento $evento, int $userId): bool
    {
        if ($userId === $evento->created_by) {
            throw new \Exception('No se puede eliminar al creador del evento');
        }

        return $evento->users()->detach($userId);
    }

    /**
     * Verificar si un usuario puede gestionar un evento
     */
    public function canManageEvento(User $user, Evento $evento): bool
    {
        return $user->hasRole(['Administrator', 'Human Resources']) || 
               $evento->created_by === $user->id ||
               ($evento->departamento_id && 
                $user->hasRole(['Department Manager', 'Department Assistant']) && 
                $user->empleado?->departamentos->contains($evento->departamento_id));
    }

    /**
     * Obtener equipos donde el usuario tiene permisos de crear y actualizar
     *
     * @param User $user
     * @return Collection
     */
    public function getTeamsWithPermissions(User $user): Collection
    {
        $teams = $user->allTeams()->filter(function ($team) use ($user) {
            $permissions = $user->teamPermissions($team);
            
            // Log para debug
           /*  Log::info("Permisos del usuario {$user->id} en equipo {$team->id}:", [
                'team_name' => $team->name,
                'permissions' => $permissions,
                'user_role' => $user->teamRole($team)->key ?? 'no_role'
            ]); */
            
            // Verificar si tiene permisos de crear o actualizar
            return in_array('create', $permissions) || 
                   in_array('update', $permissions) ||
                   $user->hasTeamPermission($team, 'create') ||
                   $user->hasTeamPermission($team, 'update');
        })->values();
        
       /*  Log::info("Equipos filtrados para usuario {$user->id}:", [
            'total_teams' => $user->allTeams()->count(),
            'filtered_teams' => $teams->count(),
            'team_names' => $teams->pluck('name')
        ]); */
        
        return $teams;
    }

    /**
     * Obtener empresas si el usuario tiene permisos para crear eventos de empresa
     *
     * @param User $user
     * @return Collection
     */
    public function getEmpresasWithPermissions(User $user): Collection
    {
        // Verificar si el usuario puede crear eventos de empresa
        if (!$this->canCreateEvento($user, 'Empresa')) {
            return collect([]);
        }

        // Si tiene permisos, retornar todas las empresas
        return Empresa::select(['id', 'nombre'])->get();
    }
} 
