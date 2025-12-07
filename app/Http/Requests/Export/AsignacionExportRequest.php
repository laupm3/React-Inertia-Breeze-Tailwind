<?php

namespace App\Http\Requests\Export;

use Illuminate\Foundation\Http\FormRequest;

class AsignacionExportRequest extends BaseExportRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $baseRules = parent::rules();
        
        // Reglas específicas para asignaciones si las hay
        $specificRules = [
            // Aquí puedes agregar reglas específicas para asignaciones
        ];
        
        return array_merge($baseRules, $specificRules);
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }
} 