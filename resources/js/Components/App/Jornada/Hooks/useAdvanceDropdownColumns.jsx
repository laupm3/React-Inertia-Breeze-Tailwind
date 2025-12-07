import { useMemo } from "react";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowActionsColumn } from "@/Components/App/AdvanceDropdown/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";

import WeekDay from "@/Pages/Admin/Jornadas/Partials/WeekDay";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { calculateTotalWeekHours } from "@/Pages/Admin/Jornadas/Utils/functions";

export function useAdvanceDropdownColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "nombre",
                title: "Nombre",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
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

                    const nombreJornada = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nombreJornada.toLowerCase().includes(value.toLowerCase())
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
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
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
                enableFiltering: false,
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <div className="flex flex-nowrap gap-2 max-w-[500px] overflow-x-auto">
                            {Object.values(row.original.esquema).map((dia, index) => (
                                <WeekDay key={index} weekday={dia} />
                            ))}
                        </div>
                    </div>
                ),
                accessorFn: (row) => '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const squema = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        squema.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}