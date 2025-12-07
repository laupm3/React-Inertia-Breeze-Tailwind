import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import WeekDay from "@/Pages/Admin/Jornadas/Partials/WeekDay";
import { useView } from "../Context/ViewContext";
import { calculateTotalWeekHours } from "@/Pages/Admin/Jornadas/Utils/functions";
import RowActionsTrigger from "@/Components/App/DataTable/Components/Columns/Components/RowActionsTrigger";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";

export function useColumns() {
    const {
        CreateUpdateViewComponent,
        SheetTableViewComponent,
        DeleteViewComponent
    } = useView();

    const views = {
        CreateUpdateViewComponent,
        SheetTableViewComponent,
        DeleteViewComponent
    };

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "nombre",
                title: "Nombre",
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
                cell: ({ row }) => (
                    <div className="text-left">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-nowrap overflow-hidden max-w-[10rem] text-ellipsis block font-medium">
                                        {row.original.name}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{row.original.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ),
                accessorFn: (row) => `${row.name}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombre = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nombre.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "total_horas",
                title: "Horario Total",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{calculateTotalWeekHours(row.original.esquema)} horas</span>,
                accessorFn: (row) => calculateTotalWeekHours(row.esquema),
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const horario = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        horario.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "dias_laborales",
                title: "Días Laborales",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <div className="flex flex-col md:flex-row flex-nowrap gap-2">
                            {Object.values(row.original.esquema).map((dia, index) => (
                                <WeekDay key={index} weekday={dia} />
                            ))}
                        </div>
                    </div>
                ),
                accessorFn: (row) => {
                    // Crear una cadena con los días laborales para filtrado
                    // Si esquema es un array de arrays
                    const esquema = row.esquema || [];
                    const diasLaborales = Object.values(esquema)
                        .filter(dia => dia && dia.turno) // Solo días con turno asignado
                        .map(dia => {
                            // Obtener el nombre del día
                            const dayName = dia.weekday_name || '';
                            // Obtener info del turno si existe
                            const turnoInfo = dia.turno ? `${dia.turno.horaInicio}-${dia.turno.horaFin}` : '';
                            // Obtener modalidad si existe
                            const modalidad = dia.modalidad?.name || '';
                            // Obtener centro si existe
                            const centro = dia.centro?.nombre || '';
                            
                            return `${dayName} ${turnoInfo} ${modalidad} ${centro}`.trim();
                        })
                        .join(' ');
                    return diasLaborales;
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const diasLaborales = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        diasLaborales.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "actions",
                title: "Acciones",
                enableHiding: false,
                enableSorting: false,
                enableFiltering: false,
                cell: ({ row }) => <RowActionsTrigger model={row.original} views={views} />
            },
        ];
        return columnsDefinition;
    }, []); // Dependencia del useMemo
}
