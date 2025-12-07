<?php

namespace App\Http\Requests\Import;

class EmpleadoImportRequest extends BaseImportRequest
{
    protected function processFileData(array $rows, $validator): array
    {
        $headers = $this->normalizeHeaders($rows[0] ?? []);
        $requiredHeaders = [
            'Nombre (*)', 
            'Primer Apellido (*)',
            //'Segundo Apellido (*)',
            'Tipo de Documento (*)',
            'Nº Documento (*)',
            'NISS (*)',
            'Email (*)',
            'Teléfono (*)',
            'Dirección (*)',
            'Fecha Nacimiento (*)',
            'Género (*)',
            'Tipo Empleado (*)',
            'Estado Empleado (*)'
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
            'Nombre (*)' => 'nombre',
            'Primer Apellido (*)' => 'primer_apellido',
            'Segundo Apellido' => 'segundo_apellido',
            'Tipo de Documento (*)' => 'tipo_documento',
            'Nº Documento (*)' => 'nif',
            'Caducidad de Documento' => 'caducidad_nif',
            'NISS (*)' => 'niss',
            'Email (*)' => 'email',
            'Email Secundario' => 'email_secundario',
            'Teléfono (*)' => 'telefono',
            'Teléfono Personal Móvil' => 'telefono_personal_movil',
            'Teléfono Personal Fijo' => 'telefono_personal_fijo',
            'Extensión Centrex' => 'extension_centrex',
            'Dirección (*)' => 'direccion',
            'Fecha Nacimiento (*)' => 'fecha_nacimiento',
            'Género (*)' => 'genero',
            'Tipo Empleado (*)' => 'tipo_empleado',
            'Estado Empleado (*)' => 'estado_empleado',
            'Contacto Emergencia' => 'contacto_emergencia',
            'Teléfono de Emergencia' => 'telefono_emergencia',
        ];
    }
}
