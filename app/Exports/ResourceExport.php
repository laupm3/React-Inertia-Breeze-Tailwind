<?php

namespace App\Exports;

use Illuminate\Contracts\Support\Responsable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Http\Resources\Json\JsonResource;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Throwable;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class ResourceExport implements FromCollection, WithHeadings, Responsable, WithCustomCsvSettings, ShouldAutoSize, WithTitle
{
    /**
     * @var mixed
     */
    protected $collection;

    /**
     * @var string
     */
    protected $resourceClass;

    /**
     * @var string
     */
    protected $filename;

    /**
     * @var array
     */
    protected $visibleColumns;

    /**
     * @var string|null
     */
    protected $sheetTitle;

    /**
     * Constructor
     *
     * @param mixed $collection
     * @param string $resourceClass
     * @param string $filename
     * @param array $visibleColumns
     * @param string|null $sheetTitle
     */
    public function __construct($collection, $resourceClass, $filename = 'export.xlsx', $visibleColumns = [], $sheetTitle = null)
    {
        $this->collection = $collection;
        $this->resourceClass = $resourceClass;
        $this->filename = $filename;
        $this->visibleColumns = $visibleColumns;
        $this->sheetTitle = $sheetTitle;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        // Obtener los headers una sola vez
        $headers = $this->getHeaders();
        
        // Verificar que la colección existe
        if (!$this->collection) {
            return collect();
        }
        
        // Transformar la colección usando el resource con columnas visibles
        return $this->collection->map(function ($item) use ($headers) {
            try {
                // Crear una nueva instancia del resource con las columnas visibles
                $resource = new $this->resourceClass($item, $this->visibleColumns);
                $data = $resource->resolve();
                
                // Asegurar que los valores estén en el mismo orden que los headers
                $orderedData = [];
                foreach ($headers as $header) {
                    $orderedData[] = $data[$header] ?? null;
                }
                return $orderedData;
            } catch (\Exception $e) {
                // Si hay error, devolver array vacío
                return array_fill(0, count($headers), null);
            }
        });
    }

    /**
     * Obtener headers del resource
     *
     * @return array
     */
    protected function getHeaders(): array
    {
        // Obtener el primer elemento y convertir el resource a array para obtener las claves
        if ($this->collection && $this->collection->count() > 0) {
            $first = $this->collection->first();
            if ($first) {
                try {
                    // Crear una nueva instancia del resource con las columnas visibles
                    $resource = new $this->resourceClass($first, $this->visibleColumns);
                    $array = $resource->resolve();
                    return array_keys($array);
                } catch (\Exception $e) {
                    // Si hay error, devolver columnas por defecto
                }
            }
        }
        
        // Si no hay datos, devolver columnas por defecto para horarios
        return [
            'Empleado', 'Contrato', 'Anexo', 'Solicitud Permiso', 'Estado Horario', 'Modalidad', 'Turno',
            'Horario Inicio', 'Horario Fin', 'Descanso Inicio', 'Descanso Fin', 'Estado Fichaje',
            'Fichaje Entrada', 'Fichaje Salida', 'Latitud Entrada', 'Longitud Entrada',
            'Latitud Salida', 'Longitud Salida', 'IP Address Entrada', 'IP Address Salida',
            'User Agent Entrada', 'User Agent Salida', 'Observaciones'
        ];
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return $this->getHeaders();
    }

    /**
     * @param mixed $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function toResponse($request)
    {
        return Excel::download($this, $this->filename);
    }

    /**
     * Handle failed export.
     *
     * @param Throwable $exception
     * @return void
     */
    public function failed(Throwable $exception): void
    {
        // Log detallado del error específico durante la generación del excel
        // Aquí podrías, por ejemplo, notificar a un canal de Slack
        // o realizar alguna otra acción de limpieza si fuera necesario.
    }
    
    /**
     * @param array $row
     * @return array
     */
    public function map($row): array
    {
        return $row;
    }

    /**
     * Configuración personalizada para exportación CSV
     *
     * @return array
     */
    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ';',
            'use_bom' => true,
            'input_encoding' => 'UTF-8',
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        if ($this->sheetTitle) {
            return $this->sheetTitle;
        }
        // Por defecto, nombre de la entidad o "Export"
        return isset($this->resourceClass) ? class_basename($this->resourceClass) : 'Export';
    }
}
