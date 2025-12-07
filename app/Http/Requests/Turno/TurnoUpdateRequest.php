<?php

namespace App\Http\Requests\Turno;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class TurnoUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => ['required', 'exists:turnos,id'],
            'centro_id' => ['required', 'exists:centros,id'],
            'nombre' => [
                'required',
                'string',
                'max:255',
                // Validar que el nombre del turno sea único para el centro_id, excepto para el turno actual
                Rule::unique('turnos')->where(function ($query) {
                    return $query
                        ->where('centro_id', $this->centro_id)
                        ->where('nombre', $this->nombre)
                        ->where('id', '!=', $this->id);
                })
            ],
            'descripcion' => ['nullable', 'string'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i'],
            'descanso_inicio' => ['nullable', 'date_format:H:i'],
            'descanso_fin' => ['nullable', 'date_format:H:i'],
            'color' => [
                'required',
                'string',
                'max:7',
                'regex:/^#[0-9A-Fa-f]{6}$/'
            ]
        ];
    }
}
