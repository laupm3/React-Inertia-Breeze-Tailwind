<?php

namespace App\Http\Requests\Import;

class ContratoImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = [
            'Email Empleado (*)', 
            'Departamento (*)', 
            'Centro (*)', 
            'CIF Empresa (*)', 
            'Tipo Contrato (*)', 
            'Fecha Inicio (*)', 
            'Es Computable (*)'
        ];
        
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
            'Email Empleado (*)' => 'empleado_email',
            'Departamento (*)' => 'departamento_nombre',
            'Centro (*)' => 'centro_nombre',
            'CIF Empresa (*)' => 'empresa_cif',
            'Asignación' => 'asignacion_nombre',
            'Tipo Contrato (*)' => 'tipo_contrato_nombre',
            'Jornada' => 'jornada_nombre',
            'Nº Expediente' => 'n_expediente',
            'Fecha Inicio (*)' => 'fecha_inicio',
            'Fecha Fin' => 'fecha_fin',
            'Es Computable (*)' => 'es_computable',
        ];
    }
}
