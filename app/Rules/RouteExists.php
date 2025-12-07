<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Route;

class RouteExists implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Si el valor está vacío, no validamos (asumiendo que el campo puede ser nulo)
        if (!$value) {
            return;
        }

        // Verificamos si la ruta existe
        if (!Route::has($value)) {
            $fail('La ruta :attribute no existe en la aplicación.');
        }
    }
}
