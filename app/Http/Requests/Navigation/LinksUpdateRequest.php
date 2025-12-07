<?php

namespace App\Http\Requests\Navigation;

use App\Rules\RouteExists;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LinksUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $authUser = Auth::user();
        return $authUser->hasPermissionTo('editLinks', 'web');
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
                'integer',
                'exists:links,id'
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('links', 'name')->ignore($this->id),
            ],
            'description' => 'nullable|string|max:500',
            'route_name' => ['nullable', 'string', 'max:255', new RouteExists],
            'icon' => 'nullable|string|max:255',
            'weight' => 'nullable|integer|min:1|max:5',
            'parent_id' => [
                'nullable',
                'exists:links,id',
                // Evitar que un enlace se asigne a sí mismo como padre
                function ($attribute, $value, $fail) {
                    if ($value == $this->id) {
                        $fail('Un enlace no puede ser su propio padre.');
                    }
                },
                // Evitar ciclos en la jerarquía
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $parent = \App\Models\Link::find($value);
                        while ($parent && $parent->parent_id) {
                            if ($parent->parent_id == $this->id) {
                                $fail('Esta relación crearía un ciclo en la jerarquía de enlaces.');
                                break;
                            }
                            $parent = $parent->parent;
                        }
                    }
                },
            ],
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
