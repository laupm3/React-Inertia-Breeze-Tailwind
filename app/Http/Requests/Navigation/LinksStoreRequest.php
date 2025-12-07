<?php

namespace App\Http\Requests\Navigation;

use App\Rules\RouteExists;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class LinksStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $authUser = Auth::user();
        return $authUser->hasPermissionTo('createLinks', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:links,name',
            'description' => 'nullable|string|max:500',
            'route_name' => ['nullable', 'string', 'max:255', new RouteExists],
            'icon' => 'nullable|string|max:255',
            'weight' => 'nullable|integer|min:1|max:5',
            'parent_id' => 'nullable|exists:links,id',
            'permission_id' => 'nullable|exists:permissions,id',
            'is_recent' => 'boolean',
            'is_important' => 'boolean',
            'requires_employee' => 'boolean',
        ];
    }

    /**
     * Mensajes personalizados para las reglas de validación.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del enlace es obligatorio.',
            'name.unique' => 'Ya existe un enlace con este nombre.',
            'parent_id.exists' => 'El enlace padre seleccionado no existe.',
            'permission_id.exists' => 'El permiso seleccionado no existe.',
        ];
    }
}
