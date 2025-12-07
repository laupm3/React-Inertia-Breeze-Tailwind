import { useDataHandler } from "../Context/DataHandlerContext";

import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import HorarioEmpleado from "@/Pages/Admin/Horarios/Components/HorarioEmpleado";
import BaseScheduleCell from "@/Pages/Admin/Horarios/Components/BaseScheduleCell";

import "@/Pages/Admin/Horarios/css/styles.css";

import {
    eachDayOfInterval,
    endOfWeek,
    format,
    getDay,
    differenceInMilliseconds,
    startOfWeek
} from "date-fns";
import { es } from 'date-fns/locale';

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import { RangeItem } from "../Components/RangeItem";


// Cambia la función columns a un hook personalizado
export function useColumns() {
    const { selectedRange } = useDataHandler();

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "empleado",
                title: "Empleado",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.empleado} />,
                accessorFn: (row) => `${row.empleado.primerApellido} ${row.empleado.segundoApellido}, ${row.empleado.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "empleado.empresas",
                title: "Empresas",
                enableHiding: false,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(empresa) => `${empresa.nombre}`}
                        valueFn={(empresa) => empresa.nombre}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.empleado.empresas) return [];
                    return row.empleado.empresas.map(empresa => empresa.nombre.toLowerCase())
                },
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreEmpresas = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreEmpresas.some((empresa) => empresa.includes(value.toLowerCase()));
                    });
                }
            },
            {
                id: "empleado.departamentos",
                title: "Departamentos",
                enableHiding: false,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(departamento) => `${departamento.nombre}`}
                        valueFn={(departamento) => departamento.nombre}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.empleado.departamentos) return [];
                    return row.empleado.departamentos.map(departamento => departamento.nombre.toLowerCase())
                },
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreDepartamentos = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreDepartamentos.some((departamento) => departamento.includes(value.toLowerCase()));
                    });
                }
            },
        ];

        return addIntervalColumns(columnsDefinition, selectedRange);
    }, [selectedRange]); // Dependencia del useMemo
}

/**
 * Genera columnas basadas en el intervarlo de fechas seleccionadas en el toolbar
 * 
 * @param {Array} columns Array de columnas existentes, a las que se les añadirán las columnas de intervalo
 * @returns {Array} Las columnas originales más las columnas del intervalo de fechas
 */
const addIntervalColumns = (columns, selectedRange) => {

    const interval = eachDayOfInterval({
        start: selectedRange.from,
        end: selectedRange.to,
    });

    const intervalCount = interval.length;

    interval.forEach((date, index) => {
        const formatedDate = format(date, "yyyy-MM-dd");

        const column = {
            accessorKey: formatedDate,
            enableSorting: true,
            enableHiding: true,
            header: () => (
                <span className="capitalize block w-full text-center">
                    {format(date, "EEE. dd MMMM", { locale: es })}
                </span>
            ),
            cell: ({ row }) => {
                const { horarios: horariosEmpleado } = row.original;
                const horariosForDate = horariosEmpleado[formatedDate];

                return horariosForDate
                    ? (
                        <BaseScheduleCell>
                            {horariosForDate.map((horario) =>
                                <RangeItem
                                    key={horario.id}
                                    value={{
                                        key: horario.id,
                                        horarioId: horario.id,
                                        empleado: {
                                            id: row.original.empleado.id,
                                            profile_photo_url: row.original.empleado?.user?.profile_photo_url,
                                            nombre: row.original.empleado.nombreCompleto
                                        },
                                        date: formatedDate
                                    }}
                                >
                                    <HorarioEmpleado horario={horario} key={horario.id} />
                                </RangeItem>
                            )}
                        </BaseScheduleCell>
                    )
                    : (
                        <BaseScheduleCell>
                            <RangeItem
                                value={{
                                    key: `${row.original.empleado.id}-${formatedDate}`,
                                    horarioId: null,
                                    empleado: {
                                        id: row.original.empleado.id,
                                        profile_photo_url: row.original.empleado?.user?.profile_photo_url,
                                        nombre: row.original.empleado.nombreCompleto
                                    },
                                    date: formatedDate
                                }}
                            >
                                <div className="grid grid-cols-1 gap-y-1">
                                    <div className='flex w-full h-28 rounded-xl' />
                                </div>
                            </RangeItem>
                        </BaseScheduleCell>
                    )
            }
        }

        columns.push(column);

        // Si el día es domingo o es el último día del intervalo, se añade la columna de estadisticas
        if (getDay(date) === 0 || index === intervalCount - 1) {
            columns.push(addStadisticsColumn(date));
        }
    });

    return columns;
}

/**
 * Esta columna se agrega para mostrar el total de horas trabajadas por empleado en cada contrato por cada rango semanal
 * 
 * @param {Date} date - Fecha de referencia para la columna
 * @returns {Object} Objeto de configuración de la columna
 */
const addStadisticsColumn = (date) => {

    const formatedDate = format(date, "yyyy-MM-dd");

    // Obtiene el rango de fechas de la semana
    const interval = eachDayOfInterval({
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
    });

    const stadisticsColumn = {
        accessorKey: `${formatedDate}-horarios-stadistics`,
        enableSorting: true,
        enableHiding: true,
        header: () => (
            <span className="capitalize block w-full text-center">
                Horas
            </span>
        ),
        cell: ({ row }) => {

            const { horarios: horariosEmpleado } = row.original;

            // Separamos los horarios que pertenecen al intervalo seleccionado
            const schedulesInInterval = interval.reduce((acc, date) => {
                const formatedDate = format(date, "yyyy-MM-dd");
                const schedulesForDate = horariosEmpleado[formatedDate];

                if (schedulesForDate) {
                    acc.push(...schedulesForDate);
                }

                return acc;
            }, []);

            // Posteriormente los agrupamos por los diferentes contratos del empleado
            const horariosPorContratos = Object.values(schedulesInInterval.reduce((acc, horario) => {
                const { id: contratoId } = horario.contrato;

                if (!acc[contratoId]) {

                    acc[contratoId] = {
                        ...horario,
                        horariosContrato: []
                    };
                }

                acc[contratoId].horariosContrato.push(horario);

                return acc;
            }, {}));

            return (
                <BaseScheduleCell className="totalHorasSemanales">
                    {horariosPorContratos.map((horariosPorContrato) => (
                        <TotalHorasSemanalesContrato
                            key={`${formatedDate}_totalSemanal_${horariosPorContrato.contrato.id}`}
                            horariosPorContrato={horariosPorContrato}
                        />
                    ))}
                </BaseScheduleCell>
            );
        }
    }

    return stadisticsColumn;
}

/**
 * TotalHorasSemanalesContrato
 * 
 * Componente que muestra un resumen de las horas trabajadas para un contrato específico 
 * dentro de un intervalo semanal. Presenta visualmente las horas reales registradas mediante
 * fichaje en comparación con las horas teóricas planificadas, junto con el nombre de la
 * asignación del contrato.
 * 
 * @param {Object} props.horariosPorContrato - Horarios asociados a un contrato específico

 * @returns {JSX.Element}
 */
function TotalHorasSemanalesContrato({ horariosPorContrato }) {
    const { contrato, horariosContrato } = horariosPorContrato;
    const { fichajeReal, totalHoras } = calculateScheduleHours(horariosContrato);

    return (
        <div className="flex flex-col items-center justify-start gap-1">
            <span className="font-semibold text-custom-blackLight dark:text-custom-white">
                {fichajeReal} horas
            </span>
            <span className="text-xs font-semibold text-custom-gray-semiDark dark:text-custom-gray-dark">
                de {totalHoras} horas
            </span>
            <span className="text-xs font-semibold text-custom-gray-semiDark dark:text-custom-gray-darker">
                {contrato.asignacion.nombre || 'Desarrollador Web'}
            </span>
        </div>
    )
}

/**
 * Función que calcula el total de horas reales trabajadas (fichajes) y horas teóricas planificadas
 * para un conjunto de registros de horario. Tiene en cuenta los periodos de descanso tanto
 * planificados como adicionales.
 * 
 * @param {Array} horarios - Array de registros de horarios que contienen:
 * @param {Date} horarios[].horario_inicio - Hora teórica de inicio del turno
 * @param {Date} horarios[].horario_fin - Hora teórica de finalización del turno
 * @param {Date|null} horarios[].descanso_inicio - Hora teórica de inicio del descanso planificado
 * @param {Date|null} horarios[].descanso_fin - Hora teórica de finalización del descanso planificado
 * @param {Date|null} horarios[].fichaje_entrada - Hora real de registro de entrada
 * @param {Date|null} horarios[].fichaje_salida - Hora real de registro de salida
 * @param {Array|null} horarios[].descansosAdicionales - Lista de descansos adicionales realizados durante el turno
 * @param {Date} horarios[].descansosAdicionales[].descanso_inicio - Hora de inicio del descanso adicional
 * @param {Date} horarios[].descansosAdicionales[].descanso_fin - Hora de finalización del descanso adicional
 * 
 * @returns {Object} Objeto con las horas calculadas
 * @returns {string} return.totalFichaje - Tiempo real trabajado en formato "HH:MM"
 * @returns {string} return.totalHoras - Tiempo teórico que debía trabajarse en formato "HH:MM"
 * 
 * @description 
 * La función calcula dos valores principales:
 * 1. Tiempo teórico: horario_fin - horario_inicio - descanso_planificado
 * 2. Tiempo real: fichaje_salida - fichaje_entrada - descansos_adicionales
 * Ambos valores se convierten de milisegundos a formato hora:minutos.
 */
const calculateScheduleHours = (horarios) => {
    const initialValue = {
        msFichajeTotal: 0,
        msTeoricoTotal: 0
    }

    const msCalculados = horarios.reduce((acc, horario) => {
        const {
            horario_inicio,
            horario_fin,
            descanso_inicio,
            descanso_fin,
            fichaje_entrada,
            fichaje_salida,
            descansosAdicionales
        } = horario;

        // Datos teóricos del horario a ejecutar
        const msDescanso = (descanso_inicio) ? differenceInMilliseconds(descanso_fin, descanso_inicio) : 0;
        const msHorario = differenceInMilliseconds(horario_fin, horario_inicio);

        // Datos reales del horario ejecutado
        const msFichaje = (fichaje_entrada && fichaje_salida)
            ? differenceInMilliseconds(fichaje_salida, fichaje_entrada)
            : 0;

        const msDescansosAdicionales = (msFichaje && descansosAdicionales)
            ? descansosAdicionales.reduce((acc, descanso) =>
                acc + differenceInMilliseconds(descanso.descanso_fin, descanso.descanso_inicio), 0)
            : 0;

        acc.msFichajeTotal += Number(msFichaje) - Number(msDescansosAdicionales);
        acc.msTeoricoTotal += Number(msHorario) - Number(msDescanso);

        return acc;
    }, initialValue);

    return {
        fichajeReal: msToTime(msCalculados.msFichajeTotal),
        totalHoras: msToTime(msCalculados.msTeoricoTotal)
    }
}

/**
 * Convierte milisegundos a un formato de tiempo legible (HH:MM).
 * 
 * @param {Number} ms - Milisegundos a convertir.
 * @returns {String} - Tiempo en formato "HH:MM".
 */
function msToTime(ms) {
    let minutes = parseInt((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)));

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    return hours + ":" + minutes;
}