<?php

namespace App\Http\Requests\Empleado;

use Closure;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use App\Services\DocumentoValidationService;

class EmpleadoStoreRequest extends FormRequest
{
    protected $documentoValidationService;

    public function __construct(DocumentoValidationService $documentoValidationService)
    {
        $this->documentoValidationService = $documentoValidationService;
    }

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
            'tipo_empleado_id' => ['required', 'exists:tipo_empleados,id'],
            'genero_id' => ['required', 'exists:generos,id'],
            'estado_id' => ['required', 'exists:estado_empleados,id'],
            'tipo_documento_id' => ['required', 'exists:tipo_documentos,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'primer_apellido' => ['required', 'string', 'max:255'],
            'segundo_apellido' => ['required', 'string', 'max:255'],
            'nif' => [
                'required', 
                'string', 
                'max:255', 
                'unique:empleados,nif',
                // Validación personalizada usando el servicio de documentos
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!$this->documentoValidationService->validateDocumento($value, $this->tipo_documento_id)) {
                        $fail($this->documentoValidationService->getErrorMessage($this->tipo_documento_id));
                    }
                }
            ],
            'caducidad_nif' => ['required', 'date', 'after:today'], // todo: validar que la fecha de caducidad del nif sea mayor a la fecha actual
            'email' => ['required', 'email', 'unique:empleados,email'],
            'email_secundario' => ['nullable', 'email'],
            'telefono' => ['required', 'string', 'max:15'],
            'telefono_personal_movil' => ['nullable', 'string', 'max:15'],
            'telefono_personal_fijo' => ['nullable', 'string', 'max:15'],
            'extension_centrex' => ['nullable', 'string', 'max:15'],
            'fecha_nacimiento' => ['required', 'date'],
            'niss' => ['required', 'string', 'max:255', 'unique:empleados,niss'],
            'contacto_emergencia' => ['nullable', 'string', 'max:255'],
            'telefono_emergencia' => ['nullable', 'string', 'max:15'],
            'observaciones_salud' => [
                'nullable', 
                'string', 
                'max:1000',
                // Solo validar si el usuario tiene permisos para ver observaciones de salud
                function (string $attribute, mixed $value, Closure $fail) {
                    if ($value && !$this->user()->hasRole(['Administrator', 'Super Admin'])) {
                        $fail('No tienes permisos para establecer observaciones de salud.');
                    }
                }
            ],
            'direccion.full_address' => ['required', 'string', 'max:255'],
            'direccion.latitud' => ['required', 'numeric', 'decimal:-90,90'],
            'direccion.longitud' => ['required', 'numeric', 'between:-180,180'],
            'direccion.codigo_postal' => ['nullable', 'string', 'max:255'],
            'direccion.numero' => ['nullable', 'string', 'max:255'],
            'direccion.piso' => ['nullable', 'string', 'max:255'],
            'direccion.puerta' => ['nullable', 'string', 'max:255'],
            'direccion.escalera' => ['nullable', 'string', 'max:255'],
            'direccion.bloque' => ['nullable', 'string', 'max:255'],
            // user_id permite asociar al empleado un usuario ya existente, si es null entonces se puede crear un usuario nuevo o no crearse
            'user_id' => [
                'nullable',
                'sometimes',
                'exists:users,id',
                // El Usuario debe ser un usuario sin empleado, agrega un mensaje custom si falla la validación
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->whereNull('empleado_id');
                })
            ],
            // Si se envía create_user como true entonces user_id debe ser nulo, si user_id no es null entonces create_user debe ser false
            'create_user' => [
                'nullable',
                'boolean',
                'required_if:user_id,null',
                // Si user_id no es null entonces create_user debe ser false
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!is_null(request('user_id')) && $value) {
                        $fail('No es posible crear un usuario y asociar un usuario en el mismo proceso.');
                    }
                },
            ],
        ];
    }
}
