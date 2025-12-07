<?php

namespace App\Http\Requests\Import;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

abstract class BaseImportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Se asume que ya se validó la autorización en el middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:xlsx,csv|max:10240', // Max 10MB
            'options' => 'array'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'El archivo es obligatorio.',
            'file.file' => 'Debe seleccionar un archivo válido.',
            'file.mimes' => 'El archivo debe ser de tipo Excel (.xlsx) o CSV (.csv).',
            'file.max' => 'El archivo no puede ser mayor a 10MB.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->hasFile('file')) {
                $this->validateFileContent($validator);
            }
        });
    }

    /**
     * Valida el contenido del archivo
     */
    protected function validateFileContent($validator)
    {
        try {
            $file = $this->file('file');
            $data = Excel::toArray(new \stdClass(), $file);
            
            if (empty($data) || empty($data[0])) {
                $validator->errors()->add('file', 'El archivo está vacío o no tiene el formato correcto.');
                return;
            }

            $rows = $data[0];
            if (count($rows) < 2) {
                $validator->errors()->add('file', 'El archivo debe tener al menos 2 filas (encabezados y una fila de datos).');
                return;
            }

            // Validar encabezados
            $headers = array_filter($rows[0] ?? []);
            if (empty($headers)) {
                $validator->errors()->add('file', 'El archivo no tiene encabezados válidos.');
                return;
            }

            // Procesar y validar los datos
            $processedData = $this->processFileData($rows, $validator);
            
            // Agregar los datos procesados al request para uso posterior
            $this->merge(['data' => $processedData]);

        } catch (\Exception $e) {
            Log::error('Error validando archivo de importación', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName()
            ]);
            
            $validator->errors()->add('file', 'Error al procesar el archivo: ' . $e->getMessage());
        }
    }

    /**
     * Procesa los datos del archivo
     * Debe ser implementado por cada request específico
     */
    abstract protected function processFileData(array $rows, $validator): array;

    /**
     * Obtiene el mapeo de columnas esperadas
     * Debe ser implementado por cada request específico
     */
    abstract protected function getColumnMapping(): array;

    /**
     * Normaliza los encabezados del archivo
     */
    protected function normalizeHeaders(array $headers): array
    {
        return array_map(function($header) {
            return trim($header);
        }, $headers);
    }

    /**
     * Valida que los encabezados requeridos estén presentes
     */
    protected function validateRequiredHeaders(array $headers, array $requiredHeaders, $validator): bool
    {
        $missingHeaders = [];
        
        foreach ($requiredHeaders as $required) {
            if (!in_array($required, $headers)) {
                $missingHeaders[] = $required;
            }
        }

        if (!empty($missingHeaders)) {
            $validator->errors()->add('file', 'Faltan las siguientes columnas obligatorias: ' . implode(', ', $missingHeaders));
            return false;
        }

        return true;
    }

    /**
     * Mapea una fila de datos usando el mapeo de columnas
     */
    protected function mapRowData(array $headers, array $row): array
    {
        $mappedData = [];
        $columnMapping = $this->getColumnMapping();

        foreach ($headers as $index => $header) {
            $value = $row[$index] ?? null;
            
            // Si existe un mapeo para este encabezado, usar la clave mapeada
            if (isset($columnMapping[$header])) {
                $mappedData[$columnMapping[$header]] = $value;
            } else {
                // Si no existe mapeo, usar el encabezado tal como está (normalizado)
                $key = strtolower(str_replace([' ', '(', ')', '*'], ['_', '', '', ''], $header));
                $mappedData[$key] = $value;
            }
        }

        return $mappedData;
    }
}
