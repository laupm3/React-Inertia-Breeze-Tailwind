<?php

namespace App\Exports;

use Illuminate\Contracts\Support\Responsable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use App\Models\Empleado;
use App\Models\Horario;
use App\Http\Resources\Export\HorarioResource;

class HorariosCSVExport implements FromCollection, WithHeadings, Responsable, WithCustomCsvSettings, ShouldAutoSize, WithTitle
{
    /**
     * @var mixed
     */
    protected $empleados;

    /**
     * @var array
     */
    protected $visibleColumns;

    /**
     * @var string
     */
    protected $filename;

    /**
     * Constructor
     *
     * @param mixed $empleados
     * @param array $visibleColumns
     * @param string $filename
     */
    public function __construct($empleados, $visibleColumns = [], $filename = 'export.csv')
    {
        $this->empleados = $empleados;
        $this->visibleColumns = $visibleColumns ?: [
            'Empleado', 'Contrato', 'Anexo', 'Solicitud Permiso', 'Estado Horario', 'Modalidad', 'Turno',
            'Horario Inicio', 'Horario Fin', 'Descanso Inicio', 'Descanso Fin', 'Estado Fichaje',
            'Fichaje Entrada', 'Fichaje Salida', 'Latitud Entrada', 'Longitud Entrada',
            'Latitud Salida', 'Longitud Salida', 'IP Address Entrada', 'IP Address Salida',
            'User Agent Entrada', 'User Agent Salida', 'Observaciones'
        ];
        $this->filename = $filename;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $allData = collect();
        $empleados = collect($this->empleados);
        
        // Si los empleados son IDs numéricos, obtener los objetos Empleado
        if (is_numeric($empleados->first())) {
            $empleados = Empleado::whereIn('id', $empleados)->get();
        }
        
        foreach ($empleados as $empleado) {
            // Obtener horarios del empleado
            $horarios = Horario::whereHas('contrato', function($q) use ($empleado) {
                $q->where('empleado_id', $empleado->id);
            })->get();
            
            // Cargar relaciones necesarias
            $horarios->load([
                'contrato.empleado', 
                'anexo.contrato.empleado', 
                'estadoHorario', 
                'modalidad', 
                'turno'
            ]);
            
            // Transformar cada horario usando el resource
            foreach ($horarios as $horario) {
                try {
                    $resource = new HorarioResource($horario, $this->visibleColumns);
                    $data = $resource->resolve();
                    
                    // Asegurar que los valores estén en el mismo orden que los headers
                    $orderedData = [];
                    foreach ($this->headings() as $header) {
                        $orderedData[] = $data[$header] ?? null;
                    }
                    
                    $allData->push($orderedData);
                } catch (\Exception $e) {
                    // Si hay error, devolver array vacío
                    $allData->push(array_fill(0, count($this->headings()), null));
                }
            }
        }
        
        return $allData;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return $this->visibleColumns;
    }

    /**
     * @param mixed $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function toResponse($request)
    {
        return \Maatwebsite\Excel\Facades\Excel::download($this, $this->filename);
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
        return 'Horarios';
    }
} 