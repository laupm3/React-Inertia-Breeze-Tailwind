<?php

namespace App\Http\Requests\Role;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class RoleUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'guard_name' => $this->guard_name ?? 'web',
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'exists:roles,id'
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                // Validar que el nombre del role sea único para el guard_name, excepto para el role actual
                Rule::unique('roles')->where(function ($query) {
                    return $query
                        ->where('centro_id', $this->centro_id)
                        ->where('nombre', $this->nombre)
                        ->where('id', '!=', $this->id);
                })
            ],
            'description' => ['nullable', 'string'],
            'guard_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
