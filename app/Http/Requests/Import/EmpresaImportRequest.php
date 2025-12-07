<?php

namespace App\Http\Requests\Import;

class EmpresaImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = [
            'Nombre (*)',
            'Siglas (*)',
            'CIF (*)',
            'Email (*)',
            'Teléfono (*)',
            'Nombre Representante (*)',
            'Nombre Adjunto (*)',
            'Dirección Completa (*)'
        ];
        
        if (!$this->validateRequiredHeaders($headers, $requiredHeaders, $validator)) {
            return [];
        }

        $processedData = [];

        // Procesar desde la fila 1 (saltamos encabezados y ejemplo)
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
            'Siglas (*)' => 'siglas',
            'CIF (*)' => 'cif',
            'Email (*)' => 'email',
            'Teléfono (*)' => 'telefono',
            'Nombre Representante (*)' => 'representante_id',
            'Nombre Adjunto (*)' => 'adjunto_id',
            'Dirección Completa (*)' => 'direccion_id',
        ];
    }
}
