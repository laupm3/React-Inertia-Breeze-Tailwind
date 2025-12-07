<?php

namespace App\Http\Requests\Contrato;

use Illuminate\Foundation\Http\FormRequest;

class ContratoUpdateRequest extends FormRequest
{
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
            'id' => ['required', 'exists:contratos,id'],
            'empleado_id' => ['required', 'exists:empleados,id'],
            'departamento_id' => ['required', 'exists:departamentos,id'],
            'centro_id' => ['required', 'exists:centros,id'],
            'asignacion_id' => ['required', 'exists:asignaciones,id'],
            'tipo_contrato_id' => ['required', 'exists:tipo_contratos,id'],
            'empresa_id' => ['required', 'exists:empresas,id'],
            'jornada_id' => ['required', 'exists:jornadas,id'],
            'n_expediente' => ['required', 'string', 'unique:contratos,n_expediente,' . $this->id],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'es_computable' => ['nullable', 'boolean'],
        ];
    }
}
