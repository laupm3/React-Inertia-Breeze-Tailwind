<?php

namespace App\Http\Requests\Permission;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class PermissionUpdateRequest extends FormRequest
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
            'id' => ['required', 'integer', 'exists:permissions,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                // Validate that permission name plus guard_name is unique
                Rule::unique('permissions')->where(function ($query) {
                    return $query
                        ->where('guard_name', $this->guard_name)
                        ->where('name', $this->name)
                        ->where('id', '!=', $this->id);
                }),
                'unique:permissions,name,' . $this->id
            ],
            'description' => ['nullable', 'string'],
            'module_id' => ['required', 'integer', 'exists:modules,id'],
            'guard_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
