<?php

namespace App\Services\Import;

use App\Models\Centro;
use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\EstadoCentro;
use App\Models\Direccion;

class CentroImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Centros';
    }

    protected function getModelClass(): string
    {
        return Centro::class;
    }

    public function getSchema(): array
    {
        return [
            'entity' => 'centros',
            'fields' => [
                [
                    'name' => 'nombre',
                    'label' => 'Nombre (*)',
                    'type' => 'string',
                    'required' => true,
                    'unique' => true,
                    'max_length' => 255,
                ],
                [
                    'name' => 'empresa_cif',
                    'label' => 'CIF Empresa (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'CIF de la empresa a la que pertenece el centro',
                ],
                [
                    'name' => 'email',
                    'label' => 'Email (*)',
                    'type' => 'email',
                    'required' => true,
                    'unique' => true,
                ],
                [
                    'name' => 'telefono',
                    'label' => 'Teléfono (*)',
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 20,
                ],
                [
                    'name' => 'responsable_nombre',
                    'label' => 'Nombre Responsable (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre del empleado responsable del centro',
                ],
                [
                    'name' => 'coordinador_nombre',
                    'label' => 'Nombre Coordinador (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre del empleado coordinador del centro',
                ],
                [
                    'name' => 'estado_nombre',
                    'label' => 'Estado (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre del estado del centro',
                ],
                [
                    'name' => 'direccion_completa',
                    'label' => 'Dirección Completa (*)',
                    'type' => 'text',
                    'required' => true,
                    'description' => 'Dirección completa del centro',
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'empresa_cif' => ['required', 'string'],
            'email' => ['required', 'email'],
            'telefono' => ['required', 'string', 'max:20'],
            'responsable_nombre' => ['required', 'string'],
            'coordinador_nombre' => ['required', 'string'],
            'estado_nombre' => ['required', 'string'],
            'direccion_completa' => ['required', 'string'],
        ];
    }

    protected function processRecord(array $data): array
    {
        $errors = [];
        $fieldErrors = [];
        $processedData = [];

        try {
            // Validar y procesar nombre
            $nombre = $this->normalizeText($data['nombre'] ?? null);
            if (empty($nombre)) {
                $errors[] = 'El nombre es obligatorio';
                $fieldErrors[] = 'nombre';
            } else {
                $processedData['nombre'] = $nombre;
            }

            // Validar y procesar empresa
            $empresaCif = $this->normalizeText($data['empresa_cif'] ?? null);
            if (empty($empresaCif)) {
                $errors[] = 'El CIF de la empresa es obligatorio';
                $fieldErrors[] = 'empresa_cif';
            } else {
                try {
                    $empresa = Empresa::where('cif', strtoupper($empresaCif))->first();
                    if (!$empresa) {
                        $errors[] = "No se encontró una empresa con el CIF '$empresaCif'";
                        $fieldErrors[] = 'empresa_cif';
                    } else {
                        $processedData['empresa_id'] = $empresa->id;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error al buscar empresa con CIF '$empresaCif': " . $e->getMessage();
                    $fieldErrors[] = 'empresa_cif';
                }
            }

        // Validar y procesar email
        $email = $this->normalizeEmail($data['email'] ?? null);
        if (empty($email)) {
            $errors[] = 'El email es obligatorio';
            $fieldErrors[] = 'email';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El formato del email no es válido';
            $fieldErrors[] = 'email';
        } else {
            $processedData['email'] = $email;
        }

        // Validar y procesar teléfono
        $telefono = $this->normalizeText($data['telefono'] ?? null);
        if (empty($telefono)) {
            $errors[] = 'El teléfono es obligatorio';
            $fieldErrors[] = 'telefono';
        } else {
            $processedData['telefono'] = $telefono;
        }

        // Validar y procesar responsable
        $responsableNombre = $this->normalizeText($data['responsable_nombre'] ?? null);
        if (empty($responsableNombre)) {
            $errors[] = 'El nombre del responsable es obligatorio';
            $fieldErrors[] = 'responsable_nombre';
        } else {
            try {
                // Buscar empleado por nombre completo usando el accessor
                $responsable = $this->findEmpleadoByFullName($responsableNombre);
                if (!$responsable) {
                    $errors[] = "No se encontró un empleado con el nombre completo '$responsableNombre'";
                    $fieldErrors[] = 'responsable_nombre';
                } else {
                    $processedData['responsable_id'] = $responsable->id;
                }
            } catch (\Exception $e) {
                $errors[] = "Error al buscar responsable '$responsableNombre': " . $e->getMessage();
                $fieldErrors[] = 'responsable_nombre';
            }
        }

        // Validar y procesar coordinador
        $coordinadorNombre = $this->normalizeText($data['coordinador_nombre'] ?? null);
        if (empty($coordinadorNombre)) {
            $errors[] = 'El nombre del coordinador es obligatorio';
            $fieldErrors[] = 'coordinador_nombre';
        } else {
            try {
                // Buscar empleado por nombre completo usando el accessor
                $coordinador = $this->findEmpleadoByFullName($coordinadorNombre);
                if (!$coordinador) {
                    $errors[] = "No se encontró un empleado con el nombre completo '$coordinadorNombre'";
                    $fieldErrors[] = 'coordinador_nombre';
                } else {
                    $processedData['coordinador_id'] = $coordinador->id;
                }
            } catch (\Exception $e) {
                $errors[] = "Error al buscar coordinador '$coordinadorNombre': " . $e->getMessage();
                $fieldErrors[] = 'coordinador_nombre';
            }
        }

        // Validar y procesar estado
        $estadoNombre = $this->normalizeText($data['estado_nombre'] ?? null);
        if (empty($estadoNombre)) {
            $errors[] = 'El estado es obligatorio';
            $fieldErrors[] = 'estado_nombre';
        } else {
            try {
                $estado = EstadoCentro::where('nombre', $estadoNombre)->first();
                if (!$estado) {
                    $errors[] = "No se encontró un estado con el nombre '$estadoNombre'";
                    $fieldErrors[] = 'estado_nombre';
                } else {
                    $processedData['estado_id'] = $estado->id;
                }
            } catch (\Exception $e) {
                $errors[] = "Error al buscar estado '$estadoNombre': " . $e->getMessage();
                $fieldErrors[] = 'estado_nombre';
            }
        }

        // Procesar dirección
        $direccionCompleta = $this->normalizeText($data['direccion_completa'] ?? null);
        if (empty($direccionCompleta)) {
            $errors[] = 'La dirección completa es obligatoria';
            $fieldErrors[] = 'direccion_completa';
        } else {
            // Crear la dirección
            try {
                $direccion = Direccion::create([
                    'full_address' => $direccionCompleta, // Usar el campo correcto
                ]);
                $processedData['direccion_id'] = $direccion->id;
            } catch (\Exception $e) {
                $errors[] = 'Error al crear la dirección: ' . $e->getMessage();
                $fieldErrors[] = 'direccion_completa';
            }
        }

        return [
            'data' => $processedData,
            'errors' => [
                'messages' => $errors,
                'fields' => array_unique($fieldErrors) // Eliminar duplicados
            ]
        ];
        
        } catch (\Exception $e) {
            // Capturar cualquier error inesperado
            return [
                'data' => [],
                'errors' => [
                    'messages' => ['Error inesperado al procesar el registro: ' . $e->getMessage()],
                    'fields' => []
                ]
            ];
        }
    }

    protected function getExampleData(): array
    {
        return [
            [
                'nombre' => 'Centro Madrid Norte',
                'empresa_cif' => 'A78136793',
                'email' => 'madrid.norte@empresa.com',
                'telefono' => '+34 900 123 456',
                'responsable_nombre' => 'Cristina Delacrúz Ibáñez',
                'coordinador_nombre' => 'Verónica Barajas Camacho',
                'estado_nombre' => 'Activo',
                'direccion_completa' => 'Calle del Centro, 45, 28020 Madrid, España'
            ],
        ];
    }

    /**
     * Usa el método genérico de procesamiento con validación de duplicados
     */
    public function processImport(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }

    /**
     * Busca un empleado por su nombre completo usando el accessor getFullNameAttribute()
     * 
     * @param string $fullName
     * @return Empleado|null
     */
    private function findEmpleadoByFullName(string $fullName): ?Empleado
    {
        // Normalizar el nombre de búsqueda
        $fullName = trim($fullName);
        
        // Intentar búsqueda exacta por concatenación de campos (nombre + primer_apellido + segundo_apellido)
        // Para SQLite usar COALESCE en lugar de IFNULL
        $empleado = Empleado::whereRaw(
            "TRIM(nombre || ' ' || COALESCE(primer_apellido, '') || ' ' || COALESCE(segundo_apellido, '')) = ?", 
            [$fullName]
        )->first();
        
        if ($empleado) {
            return $empleado;
        }
        
        // Intentar búsqueda parcial con LIKE
        $empleado = Empleado::whereRaw(
            "TRIM(nombre || ' ' || COALESCE(primer_apellido, '') || ' ' || COALESCE(segundo_apellido, '')) LIKE ?", 
            ["%$fullName%"]
        )->first();
        
        if ($empleado) {
            return $empleado;
        }
        
        // Intentar búsqueda dividiendo el nombre en partes
        $nameParts = explode(' ', $fullName);
        if (count($nameParts) >= 2) {
            $firstName = $nameParts[0];
            $lastName = implode(' ', array_slice($nameParts, 1));
            
            // Buscar por nombre y primer apellido
            $empleado = Empleado::where('nombre', 'LIKE', "%$firstName%")
                ->where(function ($query) use ($lastName) {
                    $query->where('primer_apellido', 'LIKE', "%$lastName%")
                          ->orWhere('segundo_apellido', 'LIKE', "%$lastName%");
                })
                ->first();
                
            if ($empleado) {
                return $empleado;
            }
        }
        
        // Como último recurso, cargar empleados y filtrar usando el accessor
        // (solo si hay pocos empleados para evitar problemas de performance)
        $empleadosCount = Empleado::count();
        if ($empleadosCount <= 500) { // Limitar a 500 empleados para evitar problemas de memoria
            $empleados = Empleado::with('user')->get(); // Cargar relación user por si la necesita el accessor
            
            foreach ($empleados as $empleado) {
                $empleadoFullName = $empleado->getFullNameAttribute();
                
                // Búsqueda exacta (case insensitive)
                if (strtolower(trim($empleadoFullName)) === strtolower(trim($fullName))) {
                    return $empleado;
                }
                
                // Búsqueda parcial (case insensitive)
                if (stripos($empleadoFullName, $fullName) !== false) {
                    return $empleado;
                }
            }
        }
        
        return null;
    }
}
