<?php

namespace App\Http\Requests\Anexo;

use App\Helpers\DateHelper;
use Illuminate\Foundation\Http\FormRequest;

class AnexoStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // We check if the user can create annexes for this specific contract
        return $this->user()->hasPermissionTo('createAnnexes', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contrato_id' => ['required', 'integer'],
            'jornada_id' => ['nullable', 'exists:jornadas,id'],
            // Solo se valida que la fecha de inicio sea anterior a la fecha de fin si fecha de fin está presente
            'fecha_inicio' => ['required', 'date_format:' . DateHelper::API_DATE_FORMAT, 'before:fecha_fin'],
            'fecha_fin' => ['nullable', 'date_format:' . DateHelper::API_DATE_FORMAT, 'after:fecha_inicio']
        ];
    }

    protected function prepareForValidation()
    {
        // Asegura que contrato_id esté presente y correcto
        $contrato = $this->route('contrato');
        if ($contrato) {
            $this->merge([
                'contrato_id' => $contrato->id,
            ]);
        }
    }
}
