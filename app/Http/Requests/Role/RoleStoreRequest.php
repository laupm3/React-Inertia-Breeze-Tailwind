<?php

namespace App\Http\Requests\Role;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class RoleStoreRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                // Validate that role name plus guard_name is unique
                Rule::unique('roles')->where(function ($query) {
                    return $query
                        ->where('guard_name', $this->guard_name)
                        ->where('name', $this->name);
                })
            ],
            'description' => ['nullable', 'string'],
            'guard_name' => ['nullable', 'string', 'max:255'],
            
        ];
    }
}
