<?php

namespace App\Http\Requests\SolicitudPermiso;

use App\Enums\TipoAprobacion;
use App\Models\SolicitudPermiso;
use App\Services\SolicitudPermiso\ApprovalService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class SolicitudPermisoApprovalRequest extends FormRequest
{
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tipo_aprobacion' => [
                'required',
                'string',
                Rule::in(TipoAprobacion::getAllValues())
            ],
            'aprobado' => 'required|boolean',
            'observacion' => 'nullable|string|max:1000',
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

            /**
             * @var SolicitudPermiso $solicitud
             */
            $solicitud = $this->route('solicitud');
            /**
             * @var TipoAprobacion $tipoAprobacion
             */
            $tipoAprobacion = TipoAprobacion::from($this->input('tipo_aprobacion'));

            $approbalService = app(ApprovalService::class);

            // Verificar que el usuario tiene permiso para aprobar
            if (!$approbalService->canUserApprove($this->user(), $tipoAprobacion)) {
                $validator->errors()->add(
                    'tipo_aprobacion',
                    'No tiene permiso para aprobar este tipo de solicitud.'
                );

                return;
            }

            $approvalSummary = $approbalService->getApprovalSummary($solicitud);

            // Verificar si la solicitud ya fue aprobada o rechazada
            if ($approvalSummary['fully_approved']) {
                $validator->errors()->add(
                    'tipo_aprobacion',
                    'La solicitud ya ha sido aprobada.'
                );
            }

            if ($approvalSummary['rejected']) {
                $validator->errors()->add(
                    'tipo_aprobacion',
                    'La solicitud ya ha sido rechazada.'
                );
            }

            // Verificar que no existe aprobación previa del mismo tipo
            $existingApproval = $approvalSummary['approvals']
                ->where('tipo_aprobacion', $tipoAprobacion->value)
                ->count() > 0;

            if ($existingApproval) {
                $validator->errors()->add(
                    'tipo_aprobacion',
                    'Ya existe una aprobación de este tipo para esta solicitud.'
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
            'tipo_aprobacion.required' => 'El tipo de aprobación es obligatorio.',
            'tipo_aprobacion.in' => 'El tipo de aprobación debe ser: ' . implode(', ', TipoAprobacion::getAllValues()),
            'aprobado.required' => 'Debe especificar si aprueba o rechaza.',
            'aprobado.boolean' => 'El campo aprobado debe ser true o false.',
            'observacion.max' => 'La observación no puede exceder 1000 caracteres.',
        ];
    }

    /**
     * Obtener los datos validados con procesamiento adicional.
     * Sobreescribe el método validated() para personalizar los datos retornados.
     *
     * @return array
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);
        $validated['solicitud_permiso_id'] = $this->route('solicitud')->id;
        $validated['user_id'] = $this->user()->id;
        return $validated;
    }
}
