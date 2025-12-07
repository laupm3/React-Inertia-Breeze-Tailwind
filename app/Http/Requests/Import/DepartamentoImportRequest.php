<?php

namespace App\Http\Requests\Import;

class DepartamentoImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = ['Nombre (*)'];
        
        if (!$this->validateRequiredHeaders($headers, $requiredHeaders, $validator)) {
            return [];
        }

        $processedData = [];
        
        // Procesar desde la fila 2 (saltamos encabezados y ejemplo)
        for ($i = 2; $i < count($rows); $i++) {
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
            'Descripción' => 'descripcion',
            'Email Manager' => 'manager_email',
            'Email Adjunto' => 'adjunto_email',
            'Departamento Padre' => 'parent_department_name',
        ];
    }
}
