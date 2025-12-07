<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Models\Empleado;
use App\Models\Horario;
use App\Http\Resources\Export\HorarioResource;
use Maatwebsite\Excel\Concerns\WithTitle;

class HorariosPorEmpleadoExport implements WithMultipleSheets
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
    public function __construct($empleados, $visibleColumns = [], $filename = 'export.xlsx')
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
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];
        $empleados = collect($this->empleados);
        
        // Si no son objetos Empleado, conviértelos a enteros y busca los objetos
        if (!$empleados->first() instanceof Empleado) {
            $empleadoIds = $empleados->map(fn($id) => (int)$id)->all();
            $empleados = Empleado::whereIn('id', $empleadoIds)->get();
        }
        
        foreach ($empleados as $empleado) {
            // Obtener horarios del empleado
            $horarios = Horario::whereHas('contrato', function($q) use ($empleado) {
                $q->where('empleado_id', $empleado->id);
            })->get();
            
            // Generar título de la hoja
            $sheetTitle = trim($empleado->nombre . ' ' . $empleado->primer_apellido . ($empleado->segundo_apellido ? ' ' . $empleado->segundo_apellido : ''));
            $sheetTitle = mb_substr($sheetTitle, 0, 31);
            
            $sheets[] = new HorariosEmpleadoSheetExport($horarios, $this->visibleColumns, $sheetTitle);
        }
        
        return $sheets;
    }
}

/**
 * Clase auxiliar para cada hoja, con título personalizado
 */
class HorariosEmpleadoSheetExport extends ResourceExport implements WithTitle
{
    /**
     * @var string
     */
    protected $sheetTitle;

    /**
     * Constructor
     *
     * @param mixed $collection
     * @param array $visibleColumns
     * @param string $sheetTitle
     */
    public function __construct($collection, $visibleColumns, $sheetTitle)
    {
        parent::__construct($collection, HorarioResource::class, 'sheet.xlsx', $visibleColumns, $sheetTitle);
        $this->sheetTitle = $sheetTitle;
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return $this->sheetTitle;
    }
}
