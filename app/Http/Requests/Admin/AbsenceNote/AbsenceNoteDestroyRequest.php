<?php

namespace App\Http\Requests\Admin\AbsenceNote;

use Illuminate\Foundation\Http\FormRequest;

class AbsenceNoteDestroyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    } // TODO: Añadir Policy
    public function rules(): array
    {
        return [];
    }
}
