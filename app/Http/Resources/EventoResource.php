<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Services\EventService;

class EventoResource extends JsonResource
{
    /**
     * Transforma el recurso en un array para la respuesta JSON que se enviará al cliente
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'hora_inicio' => $this->fecha_inicio?->format('H:i'),
            //'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),
            //'hora_fin' => $this->fecha_fin?->format('H:i'),
            'tipo_evento' => [
                'id' => $this->tipoEvento->id,
                'nombre' => $this->tipoEvento->nombre,
                'color' => $this->tipoEvento->color
            ],
            'creador' => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name
            ],
            'team' => $this->when($this->team_id, [
                'id' => $this->team?->id,
                'name' => $this->team?->name
            ]),
            'departamento' => $this->when($this->departamento_id, [
                'id' => $this->departamento?->id,
                'nombre' => $this->departamento?->nombre
            ]),
            'users' => $this->users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]),
            'can_manage' => $this->canManageEvento(Auth::user())
        ];
    }

    /**
     * Verifica si el usuario puede gestionar el evento
     *
     * @param User $user
     * @return bool
     */

    protected function canManageEvento($user): bool
    {
        // Si es admin o creador del evento
        if ($user->hasRole(['Super Admin', 'Administrator', 'Human Resources']) || 
            $this->created_by === $user->id) {
            return true;
        }

        // Si es manager o asistente de departamento y el evento tiene departamento
        if ($this->departamento_id && 
            $user->hasRole(['Department Manager', 'Department Assistant']) && 
            $user->empleado && 
            $user->empleado->departamentos) {
            return $user->empleado->departamentos->contains($this->departamento_id);
        }

        return false;
    }
} 