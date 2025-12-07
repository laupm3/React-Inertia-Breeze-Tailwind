<?php

namespace App\Http\Requests\Departamento;

use Illuminate\Foundation\Http\FormRequest;

class DepartamentoStoreRequest extends FormRequest
{
    /**
     * Assoc array with the key as the error bag and the value as the error message
     */
    protected $errorBag = 'updateOrCreateDepartamento';

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
            'manager_id' => ['required', 'exists:empleados,id'],
            'adjunto_id' => ['required', 'exists:empleados,id'],
            'parent_department_id' => ['nullable', 'exists:departamentos,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ];
    }
}
