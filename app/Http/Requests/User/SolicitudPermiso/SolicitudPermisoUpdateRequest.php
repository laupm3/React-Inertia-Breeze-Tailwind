<?php

namespace App\Http\Requests\User\SolicitudPermiso;

use Carbon\Carbon;
use App\Models\Empleado;
use Illuminate\Support\Arr;
use Illuminate\Foundation\Http\FormRequest;
use App\Services\SolicitudPermiso\SolicitudPermisoValidationService;
use Illuminate\Support\Facades\Log;

class SolicitudPermisoUpdateRequest extends FormRequest
{
    /**
     * El empleado autenticado que realiza la solicitud
     */
    protected ?Empleado $empleado = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $this->empleado = $this->user()->empleado;
        return $this->empleado !== null;
    }

    /**
     * Obtener el empleado validado durante el proceso de autorización
     */
    public function getEmpleado(): ?Empleado
    {
        return $this->empleado;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'permiso_id' => 'required|integer|exists:permisos,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            // Si hora_inicio existe, entonces hora_fin también debe existir
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'dia_completo' => 'required|boolean',
            'motivo' => 'required|string|max:500',
            'recuperable' => 'boolean',

            // Validación de archivos
            'files' => 'nullable|array|max:10',
            'files.*' => [
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:10240', // 10MB
            ],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Verificar que no existen errores previos
            if ($validator->errors()->count() > 0) {
                return;
            }

            // Validar reglas de fechas
            $validationService = app(SolicitudPermisoValidationService::class);

            $dateErrors = $validationService->validateDates($this->fecha_inicio, $this->fecha_fin);

            foreach ($dateErrors as $field => $error) {
                $validator->errors()->add($field, $error);
            }

            // Validar duración individual de la solicitud
            /* $durationErrors = $validationService->validateDuration(
                $this->permiso_id,
                $this->fecha_inicio,
                $this->fecha_fin
            );

            foreach ($durationErrors as $field => $error) {
                $validator->errors()->add($field, $error);
            } */

            // Obtener el ID de la solicitud que se está editando
            $solicitudId = $this->route('solicitud')?->id;

            // Validar duración acumulada anual del permiso (excluyendo la solicitud actual)
            /* $annualDurationErrors = $validationService->validateAnnualDuration(
                $this->getEmpleado()->id,
                $this->permiso_id,
                $this->fecha_inicio,
                $this->fecha_fin,
                $solicitudId
            );

            foreach ($annualDurationErrors as $field => $error) {
                $validator->errors()->add($field, $error);
            } */

            // Verify that exits a conflict with other approved requests (excluyendo la solicitud actual)
            $existsConflicts = $validationService->hasDateConflicts(
                $this->getEmpleado()->id,
                $this->fecha_inicio,
                $this->fecha_fin,
                $solicitudId
            );

            if ($existsConflicts) {
                $validator->errors()->add(
                    'fecha_inicio',
                    'Existe un conflicto con otras solicitudes aprobadas en este período.'
                );
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permiso_id.required' => 'El tipo de permiso es obligatorio.',
            'permiso_id.exists' => 'El tipo de permiso especificado no existe.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'motivo.required' => 'El motivo es obligatorio.',
            'motivo.max' => 'El motivo no puede exceder 500 caracteres.',
            'recuperable.boolean' => 'El campo recuperable debe ser verdadero o falso.',
            'observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'files.max' => 'No puede adjuntar más de 10 archivos.',
            'files.*.mimes' => 'Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG.',
            'files.*.max' => 'Cada archivo no puede exceder 10MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $fecha_inicio = Carbon::parse($this->fecha_inicio)->setTimezone(config('app.timezone'));
        $fecha_fin = Carbon::parse($this->fecha_fin)->setTimezone(config('app.timezone'));

        if ($this->hora_inicio && !$this->dia_completo) {
            $fecha_inicio->setTimeFromTimeString($this->hora_inicio);
        }
        if ($this->hora_fin && !$this->dia_completo) {
            $fecha_fin->setTimeFromTimeString($this->hora_fin);
        }

        $this->merge([ 
            'fecha_inicio' => $fecha_inicio,
            'fecha_fin' => $fecha_fin,
        ]);
    }

    /**
     * Obtener los datos validados con procesamiento adicional.
     * Sobreescribe el método validated() para personalizar los datos retornados.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        return Arr::except($validated, ['hora_inicio', 'hora_fin']);
    }
}
