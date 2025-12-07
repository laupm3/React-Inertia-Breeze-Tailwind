<?php

namespace App\Http\Requests\Import;

class CentroImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = [
            'Nombre (*)',
            'CIF Empresa (*)',
            'Email (*)',
            'Teléfono (*)',
            'Nombre Responsable (*)',
            'Nombre Coordinador (*)',
            'Estado (*)',
            'Dirección Completa (*)'
        ];

        if (!$this->validateRequiredHeaders($headers, $requiredHeaders, $validator)) {
            return [];
        }

        $processedData = [];
        
        // Procesar desde la fila 2 (saltamos encabezados)
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            
            // Saltar filas vacías
            if (empty(array_filter($row))) {
                continue;
            }

            $mappedData = $this->mapRowData($headers, $row);
            
            if (!empty($mappedData)) {
                $processedData[] = $mappedData;
            }
        }

        return $processedData;
    }

    protected function getColumnMapping(): array
    {
        return [
            'Nombre (*)' => 'nombre',
            'CIF Empresa (*)' => 'empresa_cif',
            'Email (*)' => 'email',
            'Teléfono (*)' => 'telefono',
            'Nombre Responsable (*)' => 'responsable_nombre',
            'Nombre Coordinador (*)' => 'coordinador_nombre',
            'Estado (*)' => 'estado_nombre',
            'Dirección Completa (*)' => 'direccion_completa',
        ];
    }
}
