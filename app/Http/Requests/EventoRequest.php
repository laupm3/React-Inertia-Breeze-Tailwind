<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\TipoEvento;

class EventoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // La autorización se maneja en el EventService
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable',
            'fecha_inicio' => 'required|date_format:Y-m-d',
            'hora_inicio' => 'required|date_format:H:i',
            'tipo_evento_id' => 'required|exists:tipo_eventos,id',
            'users' => 'nullable|array',
            'users.*' => 'exists:users,id',
            'team_id' => 'nullable|exists:teams,id',
            'departamento_id' => 'nullable|exists:departamentos,id',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Asegurarse de que la hora_inicio se mantenga después de la validación
        $this->merge([
            'hora_inicio' => $this->hora_inicio,
        ]);
    }

    /**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();
        
        // Asegurarse de que hora_inicio se incluya en los datos validados
        if ($this->has('hora_inicio')) {
            $validated['hora_inicio'] = $this->hora_inicio;
        }

        return $validated;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
            'tipo_evento_id.required' => 'El tipo de evento es obligatorio',
            'tipo_evento_id.exists' => 'El tipo de evento seleccionado no existe',
            //'users.required' => 'Debe seleccionar al menos un participante',
            'users.*.exists' => 'Uno o más usuarios seleccionados no existen'
        ];
    }
} 