import { useDataHandler } from "../Context/DataHandlerContext";
import { useMemo } from "react";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import STATUS_FICHAJES_MAP_COLOR from "@/Components/App/Pills/constants/StatusFichajesMapColor";
import TimelineBar from "@/Components/App/TimelineBar/TimelineBar";
import { Button } from "@/Components/App/Buttons/Button";

export function useColumns(onOpenJustificanteDialog) {
    const { selectedRange, hasActiveBreaks } = useDataHandler();

    // Formatear fecha
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '---';
        
        const fecha = new Date(fechaString);
        const hoy = new Date();
        const esHoy = fecha.toDateString() === hoy.toDateString();
        
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const diaSemana = diasSemana[fecha.getDay()];
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = meses[fecha.getMonth()];
        
        return {
            diaSemana,
            fechaCorta: `${dia} ${mes}`,
            esHoy
        };
    };

    // Determinar estado del fichaje
    const determinarEstadoFichaje = (fichajeHora, horarioEsperado, tipo, horarioInicio, horarioFin, fichajeEntrada, fichajeSalida) => {
        if (!fichajeHora || !horarioEsperado) return null;

        const isNightShift = () => {
            if (horarioInicio && horarioFin) {
                const [startHour] = horarioInicio.split(':').map(Number);
                const [endHour]   = horarioFin.split(':').map(Number);
                if (startHour > endHour) return true;
                if (startHour <= 2 && fichajeEntrada) {
                    const [entryHour] = fichajeEntrada.split(':').map(Number);
                    if (entryHour >= 20) return true;
                }
                // Caso 3: horario que termina a medianoche (20:00 -> 00:00, 21:00 -> 00:00, etc.)
                if (endHour === 0) return true;
            }
            return false;
        };

        const nightShift = isNightShift();
        const anchorTime = nightShift 
            ? ((() => {
                const [startHour] = (horarioInicio||'00:00').split(':').map(Number);
                const [endHour]   = (horarioFin||'00:00').split(':').map(Number);
                if (startHour > endHour) return horarioInicio; // caso clásico (22:00 -> 06:00)
                if (endHour === 0) return horarioInicio;       // caso termina a medianoche (20:00 -> 00:00)
                return fichajeEntrada || horarioInicio;        // caso entrada la noche anterior
            })())
            : null;

        const timeToMinutes = (timeStr) => {
            if (!timeStr) return null;
            const [hours, minutes] = timeStr.split(':').map(Number);
            let result = hours * 60 + minutes;
            
            if (nightShift && anchorTime) {
                const [anchorHours] = anchorTime.split(':').map(Number);
                
                // Caso especial: entrada anticipada en turno nocturno
                // Si es fichajeEntrada y es menor que el horario de inicio, no sumar 24h
                if (timeStr === fichajeEntrada && horarioInicio) {
                    const [startHours] = horarioInicio.split(':').map(Number);
                    if (hours < startHours) {
                        // Entrada anticipada: no sumar 24h, pertenece al mismo día
                        return result;
                    }
                }
                
                if (hours < anchorHours) {
                    result += 24 * 60;
                }
            }
            else if (!nightShift && horarioInicio) {
                const [startH, startM] = horarioInicio.split(':').map(Number);
                const startMin = startH * 60 + startM;
                if (result - startMin > 12 * 60) {
                    result -= 24 * 60;
                }
            }
            return result;
        };

        const fichajeMin = timeToMinutes(fichajeHora);
        const esperadoMin = timeToMinutes(horarioEsperado);
        const minutosDiferencia = fichajeMin - esperadoMin;

        if (tipo === 'entrada') {
            if (minutosDiferencia <= -15) return 'Entrada antes de tiempo';
            if (minutosDiferencia > 15) return 'Entrada retrasada';
            return 'Entrada a tiempo';
        }
        
        if (tipo === 'salida') {
            if (minutosDiferencia < -15) return 'Salida antes de tiempo';
            if (minutosDiferencia >= 15) return 'Salida despues de tiempo';
            return 'Salida a tiempo';
        }
        return null;
    };

    // Calcular horas trabajadas
    const calcularHorasTrabajadas = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return null;
        
        const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
        const [finHoras, finMinutos] = horaFin.split(':').map(Number);
        
        let inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
        let finEnMinutos = finHoras * 60 + finMinutos;
        
        if (finEnMinutos < inicioEnMinutos) {
            finEnMinutos += 24 * 60;
        }
        
        const diferenciaMinutos = finEnMinutos - inicioEnMinutos;
        const horas = Math.floor(diferenciaMinutos / 60);
        const minutos = diferenciaMinutos % 60;
        
        return minutos === 0 ? `${horas} hora${horas !== 1 ? 's' : ''}` : `${horas}h ${minutos}m`;
    };

    return useMemo(() => [
        rowSelectionColumn,
        {
            id: "fecha_inicio",
            title: "Fecha",
            enableHiding: false,
            enableSorting: true,
            enableFiltering: true,
            header: () => <span className="text-center">Fecha</span>,
            cell: ({ row }) => {
                const fechaFormateada = formatearFecha(row.original?.fecha_inicio);
                
                if (fechaFormateada === '---') return <span>---</span>;
                
                return (
                    <div className={`text-left font-medium ${fechaFormateada.esHoy ? 'text-orange-500' : 'text-custom-blackLight dark:text-custom-gray-default'}`}>
                        <div className="text-md">{fechaFormateada.diaSemana},</div>
                        <div className="text-lg">{fechaFormateada.fechaCorta}</div>
                    </div>
                );
            },
            accessorFn: (row) => row.original?.fecha_inicio,
        },
        {
            id: "turnos_fichados",
            title: "Turnos fichados",
            enableHiding: false,
            enableSorting: false,
            enableFiltering: false,
            header: () => <span className="text-center">Turnos fichados</span>,
            cell: ({ row }) => {
                const { fichajeEntrada, fichajeSalida, horarioInicio, horarioFin } = row.original;
                
                const estadoEntrada = fichajeEntrada ? determinarEstadoFichaje(fichajeEntrada, horarioInicio, 'entrada', horarioInicio, horarioFin, fichajeEntrada, fichajeSalida) : null;
                const estadoSalida = fichajeSalida ? determinarEstadoFichaje(fichajeSalida, horarioFin, 'salida', horarioInicio, horarioFin, fichajeEntrada, fichajeSalida) : null;
                
                const renderFichaje = (hora, estado, tipo) => (
                    <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-xs text-gray-500 font-medium">{tipo}</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium border ${
                            hora 
                                ? `${STATUS_FICHAJES_MAP_COLOR[estado]?.bg || 'bg-gray-100'} ${STATUS_FICHAJES_MAP_COLOR[estado]?.text || 'text-gray-500'} ${STATUS_FICHAJES_MAP_COLOR[estado]?.border || 'border-gray-300'}`
                                : 'bg-gray-100 text-gray-400 border-gray-300'
                        }`}>
                            {hora || '--:--'}
                        </span>
                    </div>
                );
                
                return (
                    <div className="flex items-center gap-3">
                        {renderFichaje(fichajeEntrada, estadoEntrada, 'Entrada')}
                        {renderFichaje(fichajeSalida, estadoSalida, 'Salida')}
                    </div>
                );
            },
            accessorFn: (row) => `${row.original?.fichajeEntrada || ''} ${row.original?.fichajeSalida || ''}`,
        },
        {
            id: "justificante",
            title: "Justificante",
            enableHiding: true,
            enableSorting: false,
            enableFiltering: false,
            header: () => <div className="flex justify-left"><span>Justificante</span></div>,
            cell: ({ row }) => {
                
                const tieneJustificante = row.original?.justificante && 
                    (row.original.justificante.id || row.original.justificante.file_name);
                
                return (
                    <div className="flex justify-left">
                        {tieneJustificante ? (
                            <div className="flex items-center gap-2">
                                <span className="text-green-600 text-sm">✓ Subido</span>
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {/* Ver justificante */}}
                                    className="text-custom-orange hover:text-custom-blue dark:hover:text-custom-gray-default"
                                >
                                    Ver
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenJustificanteDialog?.(row.original)}
                                className="flex items-center gap-1 text-custom-orange bg-custom-gray-default hover:bg-white text-sm font-medium"
                            >
                                <span>+ Añadir</span>
                            </Button>
                        )}
                    </div>
                );
            },
            accessorFn: (row) => row.original?.justificante || null,
        },
        {
            id: "muestra_horas",
            title: "Muestra de horas",
            enableHiding: true,
            enableSorting: false,
            enableFiltering: false,
            header: () => <span className="text-center">Muestra de horas</span>,
            cell: ({ row }) => {
                const { fichajeEntrada, fichajeSalida, horarioInicio, horarioFin, descansoInicio, descansoFin, descansos } = row.original;
                
                if (!fichajeEntrada && !fichajeSalida) {
                    return (
                        <div className="flex items-center justify-center">
                            <span className="text-gray-500 text-sm italic">No existen datos de fichaje</span>
                        </div>
                    );
                }
                
                return (
                    <TimelineBar
                        fichajeEntrada={fichajeEntrada}
                        fichajeSalida={fichajeSalida}
                        horarioInicio={horarioInicio}
                        horarioFin={horarioFin}
                        descansoInicio={descansoInicio}
                        descansoFin={descansoFin}
                        descansos={descansos}
                    />
                );
            },
            accessorFn: (row) => `${row.original?.fichajeEntrada || ''}-${row.original?.fichajeSalida || ''}`,
        },
        {
            id: "horario_asociado",
            title: "Horario asociado",
            enableHiding: true,
            enableSorting: false,
            enableFiltering: false,
            header: () => <span className="text-center">Horario asociado</span>,
            cell: ({ row }) => {
                const { horarioInicio, horarioFin, turno } = row.original;
                const horasTrabajadas = calcularHorasTrabajadas(horarioInicio, horarioFin);
                const nombreTurno = turno?.nombre?.replace(/\s*\(\d+\s*horas?\)$/i, '') || '---';
                
                return (
                    <div className="text-sm md:w-[100px] lg:w-full">
                        <div className="font-medium">{nombreTurno}</div>
                        <div className="text-gray-500 text-xs">
                            {horarioInicio && horarioFin ? `${horarioInicio} - ${horarioFin}` : '---'}
                        </div>
                        {horasTrabajadas && (
                            <div className="text-gray-400 text-xs font-medium mt-1">{horasTrabajadas}</div>
                        )}
                    </div>
                );
            },
            accessorFn: (row) => row.original?.turno?.nombre || null,
        },
    ], [selectedRange, hasActiveBreaks]);
}