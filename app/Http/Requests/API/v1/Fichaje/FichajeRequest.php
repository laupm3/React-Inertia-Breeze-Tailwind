<?php

namespace App\Http\Requests\API\v1\Fichaje;

use Illuminate\Foundation\Http\FormRequest;

class FichajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La autorización se maneja por middleware
    }

    public function rules(): array
    {
        return [
            'accion' => [
                'required', 
                'string', 
                'in:iniciar,finalizar,descanso_obligatorio,descanso_adicional,reanudar'
            ],
            'horario_id' => ['required', 'exists:horarios,id'],
            'coordenadas' => ['required_if:accion,iniciar,finalizar', 'array'],
            'coordenadas.latitud' => ['required_with:coordenadas', 'numeric'],
            'coordenadas.longitud' => ['required_with:coordenadas', 'numeric']
        ];
    }

    public function messages(): array
    {
        return [
            'accion.required' => 'La acción es requerida',
            'accion.in' => 'Acción no válida',
            'horario_id.required' => 'El ID del horario es requerido',
            'horario_id.exists' => 'El horario no existe',
            'coordenadas.required_if' => 'Las coordenadas son requeridas para iniciar o finalizar'
        ];
    }
} 