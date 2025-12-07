<?php

namespace App\Http\Requests\Asignacion;

use Illuminate\Foundation\Http\FormRequest;

class AsignacionUpdateRequest extends FormRequest
{
    protected $errorBag = 'updateOrCreateAsignacion';

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
            'id' => ['required', 'exists:asignaciones,id'],
            'nombre' => ['required', 'string', 'max:255', 'unique:asignaciones,nombre,' . $this->id],
            'descripcion' => ['required', 'string'],
        ];
    }
}
