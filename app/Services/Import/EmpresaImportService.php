<?php

namespace App\Services\Import;

use App\Models\Empresa;
use App\Models\Empleado;
use App\Models\Direccion;

class EmpresaImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Empresas';
    }

    protected function getModelClass(): string
    {
        return Empresa::class;
    }

    public function getSchema(): array
    {
        return [
            'entity' => 'empresas',
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
                    'name' => 'siglas',
                    'label' => 'Siglas (*)',
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 10,
                ],
                [
                    'name' => 'cif',
                    'label' => 'CIF (*)',
                    'type' => 'string',
                    'required' => true,
                    'unique' => true,
                    'max_length' => 15,
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
                    'name' => 'representante_id',
                    'label' => 'Nombre Representante (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre completo del empleado representante',
                ],
                [
                    'name' => 'adjunto_id',
                    'label' => 'Nombre Adjunto (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre completo del empleado adjunto',
                ],
                [
                    'name' => 'direccion_id',
                    'label' => 'Dirección Completa (*)',
                    'type' => 'text',
                    'required' => true,
                    'description' => 'Dirección completa de la empresa',
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'siglas' => ['required', 'string', 'max:10'],
            'cif' => ['required', 'string', 'max:15'],
            'email' => ['required', 'email'],
            'telefono' => ['required', 'string', 'max:20'],
            'representante_id' => ['required', 'string'],
            'adjunto_id' => ['required', 'string'],
            'direccion_id' => ['required', 'string'],
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

            // Validar y procesar siglas (opcional)
            $siglas = $this->normalizeText($data['siglas'] ?? null);
            if (empty($siglas)) {
                $errors[] = 'Las siglas son obligatorias';
                $fieldErrors[] = 'siglas';
            } else {
                $processedData['siglas'] = $siglas;
            }

            // Validar y procesar CIF
            $cif = $this->normalizeText($data['cif'] ?? null);
            if (empty($cif)) {
                $errors[] = 'El CIF es obligatorio';
                $fieldErrors[] = 'cif';
            } else {
                $processedData['cif'] = $cif;
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

            // Validar y procesar representante
            $representanteNombre = $this->normalizeText($data['representante_id'] ?? null);
            if (empty($representanteNombre)) {
                $errors[] = 'El representante es obligatorio';
                $fieldErrors[] = 'representante_id';
            }
            if (!empty($representanteNombre)) {
                try {
                    $representanteId = $this->getEmpleadoIdByName($representanteNombre);
                    if (!$representanteId) {
                        $errors[] = "No se encontró un empleado con el nombre completo '$representanteNombre' para representante";
                        $fieldErrors[] = 'representante_id';
                    } else {
                        $processedData['representante_id'] = $representanteId;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error al buscar representante '$representanteNombre': " . $e->getMessage();
                    $fieldErrors[] = 'representante_id';
                }
            }

            // Validar y procesar adjunto
            $adjuntoNombre = $this->normalizeText($data['adjunto_id'] ?? null);
            if (empty($adjuntoNombre)) {
                $errors[] = 'El adjunto es obligatorio';
                $fieldErrors[] = 'adjunto_id';
            }
            if (!empty($adjuntoNombre)) {
                try {
                    $adjuntoId = $this->getEmpleadoIdByName($adjuntoNombre);
                    if (!$adjuntoId) {
                        $errors[] = "No se encontró un empleado con el nombre completo '$adjuntoNombre' para adjunto";
                        $fieldErrors[] = 'adjunto_id';
                    } else {
                        $processedData['adjunto_id'] = $adjuntoId;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error al buscar adjunto '$adjuntoNombre': " . $e->getMessage();
                    $fieldErrors[] = 'adjunto_id';
                }
            }

            // Procesar dirección
            $direccionCompleta = $this->normalizeText($data['direccion_id'] ?? null);
            if (empty($direccionCompleta)) {
                $errors[] = 'La dirección completa es obligatoria';
                $fieldErrors[] = 'direccion_id';
            } else {
                // Crear la dirección
                try {
                    $direccion = Direccion::create([
                        'full_address' => $direccionCompleta, // Usar el campo correcto
                    ]);
                    $processedData['direccion_id'] = $direccion->id;
                } catch (\Exception $e) {
                    $errors[] = 'Error al crear la dirección: ' . $e->getMessage();
                    $fieldErrors[] = 'direccion_id';
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
                'nombre' => 'Ejemplo Empresa S.L.',
                'siglas' => 'EE',
                'cif' => 'A12345678',
                'email' => 'ejemplo@empresa.com',
                'telefono' => '912345678',
                'representante_id' => 'Cristina Delacrúz Ibáñez',
                'adjunto_id' => 'Verónica Barajas Camacho',
                'direccion_id' => 'Calle Ejemplo 123, 28001 Madrid',
            ]
        ];
    }

    public function processImport(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }

    private function getEmpleadoIdByName(?string $nombreCompleto): ?int
    {
        if (empty($nombreCompleto)) {
            return null;
        }

        // Usar SQLite compatible CONCAT equivalente
        $empleado = Empleado::whereRaw("nombre || ' ' || primer_apellido || COALESCE(' ' || segundo_apellido, '') = ?", [$nombreCompleto])
            ->first();

        if ($empleado) {
            return $empleado->id;
        }

        // Si no se encuentra, buscar por coincidencia parcial
        $partes = explode(' ', $nombreCompleto);
        if (count($partes) >= 2) {
            $nombre = $partes[0];
            $primerApellido = $partes[1];
            $segundoApellido = $partes[2] ?? null;

            $query = Empleado::where('nombre', 'LIKE', "%{$nombre}%")
                ->where('primer_apellido', 'LIKE', "%{$primerApellido}%");

            if ($segundoApellido) {
                $query->where('segundo_apellido', 'LIKE', "%{$segundoApellido}%");
            }

            $empleado = $query->first();
            return $empleado ? $empleado->id : null;
        }

        return null;
    }
}
