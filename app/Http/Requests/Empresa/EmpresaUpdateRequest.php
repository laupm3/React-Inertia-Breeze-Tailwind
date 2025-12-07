<?php

namespace App\Http\Requests\Empresa;

use Illuminate\Foundation\Http\FormRequest;

class EmpresaUpdateRequest extends FormRequest
{
    /**
     * Assoc array with the key as the error bag and the value as the error message
     */
    protected $errorBag = 'updateOrCreateEmpresa';

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
            'id' => ['required', 'exists:empresas,id'],
            'representante_id' => ['required', 'exists:empleados,id'],
            'adjunto_id' => ['required', 'exists:empleados,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'siglas' => ['required', 'string', 'max:255'],
            'cif' => ['required', 'string', 'unique:empresas,cif,' . $this->id],
            'email' => ['required', 'email'],
            'telefono' => ['required', 'string', 'max:15'],
            'direccion.id' => ['required', 'exists:direcciones,id'],
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
