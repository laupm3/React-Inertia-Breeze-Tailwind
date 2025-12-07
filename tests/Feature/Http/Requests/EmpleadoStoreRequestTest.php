<?php

namespace Tests\Feature\Http\Requests;

use App\Http\Requests\Empleado\EmpleadoStoreRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class EmpleadoStoreRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the validation rules of EmpleadoStoreRequest.
     */
    public function testEmpleadoStoreRequestValidation()
    {
        $data = [
            'tipo_empleado_id' => 1,
            'genero_id' => 1,
            'estado_id' => 1,
            'tipo_documento_id' => 1,
            'nombre' => 'John',
            'primer_apellido' => 'Doe',
            'segundo_apellido' => 'Smith',
            'nif' => '12345678A',
            'email' => 'john.doe@example.com',
            'telefono' => '123456789',
            'fecha_nacimiento' => '1990-01-01',
            'niss' => '1234567890',
            'direccion' => [
                'full_address' => '123 Main St',
                'latitud' => 40.7128,
                'longitud' => -74.0060,
            ],
            'user_id' => null,
            'create_user' => true,
        ];

        $request = new EmpleadoStoreRequest();

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    /**
     * Test the validation failure of EmpleadoStoreRequest.
     */
    public function testEmpleadoStoreRequestValidationFailure()
    {
        $data = [
            'tipo_empleado_id' => null,
            'genero_id' => null,
            'estado_id' => null,
            'tipo_documento_id' => null,
            'nombre' => '',
            'primer_apellido' => '',
            'segundo_apellido' => '',
            'nif' => '',
            'email' => 'invalid-email',
            'telefono' => '',
            'fecha_nacimiento' => 'invalid-date',
            'niss' => '',
            'direccion' => [
                'full_address' => '',
                'latitud' => 'invalid-latitude',
                'longitud' => 'invalid-longitude',
            ],
            'user_id' => 1,
            'create_user' => true,
        ];

        $request = new EmpleadoStoreRequest();

        $validator = Validator::make($data, $request->rules());

        $this->assertFalse($validator->passes());
    }
}