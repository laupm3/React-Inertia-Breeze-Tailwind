<?php

namespace App\Http\Requests\Centro;

use Illuminate\Foundation\Http\FormRequest;

class CentroStoreRequest extends FormRequest
{
    /**
     * Assoc array with the key as the error bag and the value as the error message
     */
    protected $errorBag = 'updateOrCreateCentro';

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
            'empresa_id' => ['nullable', 'exists:empresas,id'],
            'responsable_id' => ['required', 'exists:empleados,id'],
            'coordinador_id' => ['required', 'exists:empleados,id'],
            'estado_id' => ['required', 'exists:estado_centros,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'telefono' => ['required', 'string', 'max:15'],
            'direccion.full_address' => ['required', 'string', 'max:255'],
            'direccion.latitud' => ['required', 'numeric', 'decimal:-90,90'],
            'direccion.longitud' => ['required', 'numeric', 'between:-180,180'],
            'direccion.codigo_postal' => ['nullable', 'string', 'max:255'],
            'direccion.numero' => ['nullable', 'string', 'max:255'],
            'direccion.piso' => ['nullable', 'string', 'max:255'],
            'direccion.puerta' => ['nullable', 'string', 'max:255'],
            'direccion.escalera' => ['nullable', 'string', 'max:255'],
            'direccion.bloque' => ['nullable', 'string', 'max:255'],
        ];
    }
}
