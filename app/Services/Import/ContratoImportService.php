<?php

namespace App\Services\Import;

use App\Models\Contrato;
use App\Models\Empleado;
use App\Models\Departamento;
use App\Models\Centro;
use App\Models\Asignacion;
use App\Models\TipoContrato;
use App\Models\Empresa;
use App\Models\Jornada;
use Illuminate\Support\Facades\Log;

class ContratoImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Contratos';
    }

    protected function getModelClass(): string
    {
        return Contrato::class;
    }

    public function getSchema(): array
    {
        return [
            'entity' => 'contratos',
            'fields' => [
                [
                    'name' => 'empleado_nombre_completo',
                    'label' => 'Empleado (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre completo del empleado para el contrato',
                ],
                [
                    'name' => 'departamento_nombre',
                    'label' => 'Departamento (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre del departamento',
                ],
                [
                    'name' => 'centro_nombre',
                    'label' => 'Centro (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Nombre del centro',
                ],
                [
                    'name' => 'empresa_cif',
                    'label' => 'CIF Empresa (*)',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'CIF de la empresa',
                ],
                [
                    'name' => 'asignacion_nombre',
                    'label' => 'Asignación',
                    'type' => 'string',
                    'required' => false,
                    'description' => 'Nombre de la asignación',
                ],
                [
                    'name' => 'tipo_contrato_nombre',
                    'label' => 'Tipo Contrato (*)',
                    'type' => 'select',
                    'required' => true,
                    'description' => 'Clave del tipo de contrato',
                    'options' => TipoContrato::pluck('clave')->unique()->sort()->values()->toArray(),
                ],
                [
                    'name' => 'jornada_nombre',
                    'label' => 'Jornada',
                    'type' => 'string',
                    'required' => false,
                    'description' => 'Nombre de la jornada',
                ],
                [
                    'name' => 'n_expediente',
                    'label' => 'Nº Expediente',
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 50,
                ],
                [
                    'name' => 'fecha_inicio',
                    'label' => 'Fecha Inicio (*)',
                    'type' => 'date',
                    'required' => true,
                    'format' => 'YYYY-MM-DD',
                ],
                [
                    'name' => 'fecha_fin',
                    'label' => 'Fecha Fin',
                    'type' => 'date',
                    'required' => false,
                    'format' => 'YYYY-MM-DD',
                ],
                [
                    'name' => 'es_computable',
                    'label' => 'Es Computable (*)',
                    'type' => 'boolean',
                    'required' => true,
                    'options' => ['SI', 'NO', '1', '0', 'true', 'false'],
                    'default' => 'SI',
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        return [
            'empleado_nombre_completo' => ['required', 'string'],
            'departamento_nombre' => ['required', 'string'],
            'centro_nombre' => ['required', 'string'],
            'empresa_cif' => ['required', 'string'],
            'asignacion_nombre' => ['nullable', 'string'],
            'tipo_contrato_nombre' => ['required', 'string'],
            'jornada_nombre' => ['nullable', 'string'],
            'n_expediente' => ['nullable', 'string', 'max:50'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after:fecha_inicio'],
            'es_computable' => ['required', 'boolean'],
        ];
    }

    protected function processRecord(array $data): array
    {
        $errors = [];
        $errorFields = [];
        $processedData = [];

        // Validar y procesar empleado
        $empleadoNombreCompleto = $this->normalizeText($data['empleado_nombre_completo'] ?? null);
        if (empty($empleadoNombreCompleto)) {
            $errors[] = 'El Empleado es obligatorio';
            $errorFields[] = 'empleado_nombre_completo';
        } else {
            // Buscar empleado por nombre completo usando el accessor full_name
            $empleado = null;
            $empleados = Empleado::all();
            
            foreach ($empleados as $emp) {
                $nombreCompleto = $emp->nombre . ' ' . $emp->primer_apellido;
                if (!empty($emp->segundo_apellido)) {
                    $nombreCompleto .= ' ' . $emp->segundo_apellido;
                }
                if ($nombreCompleto === $empleadoNombreCompleto) {
                    $empleado = $emp;
                    break;
                }
            }
            
            if (!$empleado) {
                $errors[] = "No se encontró un empleado con el nombre completo: {$empleadoNombreCompleto}";
                $errorFields[] = 'empleado_nombre_completo';
            } else {
                $processedData['empleado_id'] = $empleado->id;
            }
        }

        // Validar y procesar departamento
        $departamentoNombre = $this->normalizeText($data['departamento_nombre'] ?? null);
        if (empty($departamentoNombre)) {
            $errors[] = 'El Departamento es obligatorio';
            $errorFields[] = 'departamento_nombre';
        } else {
            $departamento = Departamento::where('nombre', $departamentoNombre)->first();
            if (!$departamento) {
                $errors[] = 'No se encontró un departamento con el nombre proporcionado en Departamento';
                $errorFields[] = 'departamento_nombre';
            } else {
                $processedData['departamento_id'] = $departamento->id;
            }
        }

        // Validar y procesar centro
        $centroNombre = $this->normalizeText($data['centro_nombre'] ?? null);
        if (empty($centroNombre)) {
            $errors[] = 'El Centro es obligatorio';
            $errorFields[] = 'centro_nombre';
        } else {
            $centro = Centro::where('nombre', $centroNombre)->first();
            if (!$centro) {
                $errors[] = 'No se encontró un centro con el nombre proporcionado en Centro';
                $errorFields[] = 'centro_nombre';
            } else {
                $processedData['centro_id'] = $centro->id;
            }
        }

        // Validar y procesar empresa
        $empresaCif = strtoupper(trim($data['empresa_cif'] ?? null));

        // LOGS DE DEBUG
        Log::info('🔑 Claves recibidas en $data:', array_keys($data));
        Log::info('🔎 Valor recibido de empresa_cif:', [$data['empresa_cif'] ?? null]);
        Log::info('🔎 Valor normalizado de empresa_cif:', [$empresaCif]);

        // LOG para ver los CIF existentes en la base de datos (opcional, solo para debug)
        $allCifs = Empresa::pluck('cif')->toArray();
        Log::info('📋 CIFs en la base de datos:', $allCifs);

        if (empty($empresaCif)) {
            $errors[] = 'El CIF Empresa es obligatorio';
            $errorFields[] = 'empresa_cif';
        } else {
            // Búsqueda robusta
            $empresa = Empresa::whereRaw('TRIM(UPPER(cif)) = ?', [trim(strtoupper($empresaCif))])->first();
            if (!$empresa) {
                $errors[] = 'No se encontró una empresa con el CIF proporcionado en CIF Empresa';
                $errorFields[] = 'empresa_cif';
            } else {
                $processedData['empresa_id'] = $empresa->id;
            }
        }

        // Procesar asignación (opcional)
        $asignacionNombre = $this->normalizeText($data['asignacion_nombre'] ?? null);
        if (!empty($asignacionNombre)) {
            $asignacion = Asignacion::where('nombre', $asignacionNombre)->first();
            if (!$asignacion) {
                $errors[] = 'No se encontró una asignación con el nombre proporcionado en Asignación';
                $errorFields[] = 'asignacion_nombre';
            } else {
                $processedData['asignacion_id'] = $asignacion->id;
            }
        }

        // Validar y procesar tipo de contrato
        $tipoContratoClave = $this->normalizeText($data['tipo_contrato_nombre'] ?? null);
        if (empty($tipoContratoClave)) {
            $errors[] = 'El Tipo Contrato es obligatorio';
            $errorFields[] = 'tipo_contrato_nombre';
        } else {
            $tipoContrato = TipoContrato::where('clave', $tipoContratoClave)->first();
            if (!$tipoContrato) {
                $availableClaves = TipoContrato::pluck('clave')->unique()->sort()->take(5)->implode(', ');
                $errors[] = "No se encontró un tipo de contrato con la clave '$tipoContratoClave' en Tipo Contrato. Claves disponibles: $availableClaves";
                $errorFields[] = 'tipo_contrato_nombre';
            } else {
                $processedData['tipo_contrato_id'] = $tipoContrato->id;
            }
        }

        // Procesar jornada (opcional)
        $jornadaNombre = $this->normalizeText($data['jornada_nombre'] ?? null);
        if (!empty($jornadaNombre)) {
            $jornada = Jornada::where('name', $jornadaNombre)->first();
            if (!$jornada) {
                $errors[] = "No se encontró una jornada con el nombre proporcionado: {$jornadaNombre}";
                $errorFields[] = 'jornada_nombre';
            } else {
                $processedData['jornada_id'] = $jornada->id;
            }
        }

        // Procesar número de expediente
        $nExpediente = $this->normalizeText($data['n_expediente'] ?? null);
        if (!empty($nExpediente)) {
            $processedData['n_expediente'] = $nExpediente;
        }

        // Validar y procesar fecha de inicio
        $fechaInicio = $this->normalizeDate($data['fecha_inicio'] ?? null);
        if (empty($fechaInicio)) {
            $errors[] = 'La Fecha Inicio es obligatoria';
            $errorFields[] = 'fecha_inicio';
        } else {
            $processedData['fecha_inicio'] = $fechaInicio;
        }

        // Procesar fecha de fin (opcional)
        $fechaFin = $this->normalizeDate($data['fecha_fin'] ?? null);
        if (!empty($fechaFin)) {
            if (!empty($fechaInicio) && $fechaFin <= $fechaInicio) {
                $errors[] = 'La Fecha Fin debe ser posterior a la Fecha Inicio';
                $errorFields[] = 'fecha_fin';
            } else {
                $processedData['fecha_fin'] = $fechaFin;
            }
        }

        // Validar y procesar es_computable
        $esComputable = $this->normalizeText($data['es_computable'] ?? 'SI');
        $esComputableValue = in_array(strtoupper($esComputable), ['SI', '1', 'TRUE', 'YES']) ? 1 : 0;
        $processedData['es_computable'] = $esComputableValue;

        return [
            'data' => $processedData,
            'errors' => [
                'messages' => $errors,
                'fields' => $errorFields
            ]
        ];
    }

    protected function getExampleData(): array
    {
        return [
            'Juan Pérez García',
            'Recursos Humanos',
            'Centro Madrid Norte',
            'B12345678',
            'Proyecto Alpha',
            '100', // Cambiado a clave numérica real
            'Mañana 40 horas semanales de lunes a viernes',
            'EXP-2025-001',
            '2025-01-01',
            '',
            'SI'
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
     * Mapea errores de campos de base de datos a nombres del schema
     */
    protected function mapDatabaseErrorsToSchemaFields(array $errors): array
    {
        $fieldMapping = [
            'empleado_id' => 'empleado_nombre_completo',
            'departamento_id' => 'departamento_nombre',
            'centro_id' => 'centro_nombre',
            'empresa_id' => 'empresa_cif',
            'asignacion_id' => 'asignacion_nombre',
            'tipo_contrato_id' => 'tipo_contrato_nombre',
            'jornada_id' => 'jornada_nombre',
        ];

        $mappedErrors = [];
        
        foreach ($errors as $field => $messages) {
            $schemaField = $fieldMapping[$field] ?? $field;
            $mappedErrors[$schemaField] = $messages;
        }

        return $mappedErrors;
    }

    /**
     * Convierte errores de base de datos en mensajes amigables específicos para contratos
     */
    protected function convertDatabaseErrorToFriendlyMessage(\Exception $e, array $row): array
    {
        $errorMessage = $e->getMessage();
        
        // Detectar errores de constraint NOT NULL específicos para contratos
        if (strpos($errorMessage, 'NOT NULL constraint failed') !== false) {
            if (preg_match('/NOT NULL constraint failed: \w+\.(\w+)/', $errorMessage, $matches)) {
                $fieldName = $matches[1];
                
                // Mapeo específico para contratos
                $fieldMapping = [
                    'empleado_id' => 'Empleado (*)',
                    'departamento_id' => 'Departamento (*)',
                    'centro_id' => 'Centro (*)',
                    'empresa_id' => 'CIF Empresa (*)',
                    'tipo_contrato_id' => 'Tipo Contrato (*)',
                    'fecha_inicio' => 'Fecha Inicio (*)',
                    'es_computable' => 'Es Computable (*)'
                ];
                
                $schemaFieldMapping = [
                    'empleado_id' => 'empleado_nombre_completo',
                    'departamento_id' => 'departamento_nombre',
                    'centro_id' => 'centro_nombre',
                    'empresa_id' => 'empresa_cif',
                    'tipo_contrato_id' => 'tipo_contrato_nombre',
                    'fecha_inicio' => 'fecha_inicio',
                    'es_computable' => 'es_computable'
                ];
                
                if (isset($fieldMapping[$fieldName])) {
                    $fieldLabel = $fieldMapping[$fieldName];
                    $schemaField = $schemaFieldMapping[$fieldName];
                    
                    return [
                        'messages' => ["El campo {$fieldLabel} es obligatorio"],
                        'fields' => [$schemaField]
                    ];
                }
            }
        }
        
        // Para otros errores, usar el método padre
        return parent::convertDatabaseErrorToFriendlyMessage($e, $row);
    }
}
