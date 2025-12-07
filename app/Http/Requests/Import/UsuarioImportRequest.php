<?php

namespace App\Http\Requests\Import;

class UsuarioImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = ['Nombre (*)', 'Email (*)', 'Contraseña (*)', 'Estado (*)'];
        
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
            'Nombre (*)' => 'name',
            'Email (*)' => 'email', 
            'Contraseña (*)' => 'password',
            'Email del Empleado' => 'empleado_email',
            'Descripción' => 'descripcion',
            'Estado (*)' => 'status',
        ];
    }
}
