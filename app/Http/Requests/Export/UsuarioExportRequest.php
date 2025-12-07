<?php

namespace App\Http\Requests\Export;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request class for Usuario export operations
 */
class UsuarioExportRequest extends BaseExportRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $baseRules = parent::rules();
        
        // Reglas específicas para usuarios si las hay
        $specificRules = [
            // Aquí se pueden agregar reglas específicas para usuarios
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