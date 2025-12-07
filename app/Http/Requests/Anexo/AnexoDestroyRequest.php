<?php

namespace App\Http\Requests\Anexo;

use Illuminate\Foundation\Http\FormRequest;

class AnexoDestroyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('deleteAnnexes', 'web');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
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
