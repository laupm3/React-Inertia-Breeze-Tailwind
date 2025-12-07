<?php

namespace App\Http\Resources\Export;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for Horario export operations
 */
class HorarioResource extends JsonResource
{
    /**
     * @var array
     */
    protected $visibleColumns;

    /**
     * Constructor
     *
     * @param mixed $resource
     * @param array $visibleColumns
     */
    public function __construct($resource, $visibleColumns = [])
    {
        parent::__construct($resource);
        $this->visibleColumns = $visibleColumns;
    }

    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $allColumns = [
            'Empleado' => $this->getEmpleadoName(),
            'Contrato' => $this->contrato?->n_expediente ?? $this->contrato?->id ?? 'N/A',
            // Mostrar el nombre del anexo si existe
            'Anexo' => $this->anexo
                ? ('Anexo #' . $this->anexo->id . ' (Contrato: ' . ($this->anexo->contrato?->n_expediente ?? $this->anexo->contrato?->id ?? 'N/A') . ')')
                : 'N/A',
            'Solicitud Permiso' => $this->solicitud_permiso_id ? 'Sí' : 'No',
            'Estado Horario' => $this->estadoHorario?->name ?? 'N/A',
            'Modalidad' => $this->modalidad?->name ?? 'N/A',
            'Turno' => $this->turno?->nombre ?? 'N/A',
            'Horario Inicio' => $this->horario_inicio ? \Carbon\Carbon::parse($this->horario_inicio)->format('Y-m-d H:i:s') : null,
            'Horario Fin' => $this->horario_fin ? \Carbon\Carbon::parse($this->horario_fin)->format('Y-m-d H:i:s') : null,
            'Descanso Inicio' => $this->descanso_inicio ? \Carbon\Carbon::parse($this->descanso_inicio)->format('Y-m-d H:i:s') : null,
            'Descanso Fin' => $this->descanso_fin ? \Carbon\Carbon::parse($this->descanso_fin)->format('Y-m-d H:i:s') : null,
            'Estado Fichaje' => $this->estado_fichaje ? ucfirst(str_replace('_', ' ', $this->estado_fichaje)) : null,
            'Fichaje Entrada' => $this->fichaje_entrada ? \Carbon\Carbon::parse($this->fichaje_entrada)->format('Y-m-d H:i:s') : null,
            'Fichaje Salida' => $this->fichaje_salida ? \Carbon\Carbon::parse($this->fichaje_salida)->format('Y-m-d H:i:s') : null,
            'Latitud Entrada' => $this->latitud_entrada ? number_format($this->latitud_entrada, 6) : null,
            'Longitud Entrada' => $this->longitud_entrada ? number_format($this->longitud_entrada, 6) : null,
            'Latitud Salida' => $this->latitud_salida ? number_format($this->latitud_salida, 6) : null,
            'Longitud Salida' => $this->longitud_salida ? number_format($this->longitud_salida, 6) : null,
            'IP Address Entrada' => $this->ip_address_entrada,
            'IP Address Salida' => $this->ip_address_salida,
            'User Agent Entrada' => $this->user_agent_entrada,
            'User Agent Salida' => $this->user_agent_salida,
            'Observaciones' => $this->observaciones,
        ];

        // Para horarios, devolver todas las columnas por defecto
        // ya que la tabla de horarios es dinámica
        return $allColumns;
    }

    /**
     * Obtiene el nombre completo del empleado asociado al horario
     *
     * @return string
     */
    protected function getEmpleadoName(): string
    {
        $empleado = null;

        if ($this->contrato && $this->contrato->empleado) {
            $empleado = $this->contrato->empleado;
        } elseif ($this->anexo && $this->anexo->contrato && $this->anexo->contrato->empleado) {
            $empleado = $this->anexo->contrato->empleado;
        }

        if ($empleado) {
            $nombre = trim($empleado->nombre ?? '');
            $apellidos = trim(($empleado->primer_apellido ?? '') . ' ' . ($empleado->segundo_apellido ?? ''));
            if ($nombre && $apellidos) {
                return $nombre . ' ' . $apellidos;
            } elseif ($nombre) {
                return $nombre;
            } elseif ($apellidos) {
                return $apellidos;
            }
        }

        return 'N/A';
    }
}
