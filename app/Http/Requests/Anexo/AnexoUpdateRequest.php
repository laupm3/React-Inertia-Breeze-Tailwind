<?php

namespace App\Http\Requests\Anexo;

use App\Helpers\DateHelper;
use Illuminate\Foundation\Http\FormRequest;

class AnexoUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('editAnnexes', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jornada_id' => ['nullable', 'exists:jornadas,id'],
            'fecha_inicio' => ['required', 'date_format:'.DateHelper::API_DATE_FORMAT, 'before:fecha_fin'],
            'fecha_fin' => ['required', 'date_format:'.DateHelper::API_DATE_FORMAT, 'after:fecha_inicio']
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $contrato = $this->route('contrato');
            $anexo = $this->route('anexo');
            if ($contrato && $anexo && $anexo->contrato_id != $contrato->id) {
                $validator->errors()->add('anexo', 'El anexo no pertenece al contrato especificado.');
            }
        });
    }

}
