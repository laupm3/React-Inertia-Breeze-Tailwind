<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DireccionRequestStore extends FormRequest
{
    /**
     * Assoc array with the key as the error bag and the value as the error message
     */
    public $errorBag = 'createDireccion';

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
            'direccion.full_address' => ['required', 'string', 'max:255'],
            'direccion.latitud' => ['required', 'numeric', 'decimal:-90,90'],
            'direccion.longitud' => ['required', 'numeric', 'between:-180,180'],
            'direccion.codigo_postal' => ['string', 'max:255'],
            'direccion.numero' => ['string', 'max:255'],
            'direccion.piso' => ['string', 'max:255'],
            'direccion.puerta' => ['string', 'max:255'],
            'direccion.escalera' => ['string', 'max:255'],
            'direccion.bloque' => ['string', 'max:255'],
        ];
    }
}
