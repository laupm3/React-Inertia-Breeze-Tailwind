<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class TeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => [
                'required',
                'exists:teams,id',
                function ($attribute, $value, $fail) {
                    $user = Auth::user();
                    $team = $user->allTeams()->find($value);
                    
                    if (!$team) {
                        $fail('No perteneces a este equipo.');
                        return;
                    }

                    $permissions = $user->teamPermissions($team);
                    if (!in_array('create', $permissions) || !in_array('update', $permissions)) {
                        $fail('No tienes los permisos necesarios en este equipo.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'team_id.required' => 'El equipo es requerido',
            'team_id.exists' => 'El equipo seleccionado no existe'
        ];
    }
} 