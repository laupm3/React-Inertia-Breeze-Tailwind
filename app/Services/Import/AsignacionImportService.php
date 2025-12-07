<?php

namespace App\Services\Import;

use App\Models\Asignacion;
use Illuminate\Support\Facades\Log;

class AsignacionImportService extends BaseImportService
{
    protected function getEntityName(): string
    {
        return 'Asignaciones';
    }

    protected function getModelClass(): string
    {
        return Asignacion::class;
    }

    public function getSchema(): array
    {
        return [
            'entity' => 'asignaciones',
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
                    'name' => 'descripcion',
                    'label' => 'Descripción',
                    'type' => 'text',
                    'required' => false,
                ],
            ]
        ];
    }

    protected function getValidationRules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
        ];
    }

    protected function processRecord(array $data): array
    {
        $errors = [];
        $processedData = [];

        // Validar y procesar nombre
        $nombre = $this->normalizeText($data['nombre'] ?? null);
        if (empty($nombre)) {
            $errors[] = 'El nombre es obligatorio';
        } else {
            $processedData['nombre'] = $nombre;
        }

        // Procesar descripción
        $descripcion = $this->normalizeText($data['descripcion'] ?? null);
        if (!empty($descripcion)) {
            $processedData['descripcion'] = $descripcion;
        }

        return [
            'data' => $processedData,
            'errors' => [
                'messages' => $errors,
                'fields' => []
            ]
        ];
    }

    protected function getExampleData(): array
    {
        return [
            'Proyecto Alpha',
            'Asignación para el desarrollo del proyecto Alpha durante Q1 2025'
        ];
    }

    /**
     * Usa el método genérico de procesamiento con validación de duplicados y atomicidad
     * Este método es atómico: todo o nada. Si hay errores, no se guarda ningún registro.
     */
    public function processImport(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }

    /**
     * Método alternativo que usa la lógica genérica (para compatibilidad)
     */
    public function processImportWithGenericValidation(array $validatedData): array
    {
        return $this->processImportGeneric($validatedData);
    }
}
