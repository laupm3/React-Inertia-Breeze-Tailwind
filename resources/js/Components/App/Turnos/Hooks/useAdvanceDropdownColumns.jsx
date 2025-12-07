import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import Icon from "@/imports/LucideIcon";
import { rowActionsColumn } from "@/Components/App/AdvanceDropdown/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

export function useAdvanceDropdownColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "empleado",
                title: "Nombre completo",
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
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-row gap-2 pb-2">
                                    <div
                                        className="inline-block min-w-6 w-6 min-h-6 h-6 rounded-lg"
                                        style={{ backgroundColor: row.original.color }}
                                    />

                                    <div className="flex flex-col gap-1">
                                        <p>{row.original.nombre}</p>

                                         <span className="flex flex-row items-center gap-1 text-xs p-1 px-2 rounded-full bg-custom-gray-default dark:bg-custom-blackLight w-fit">
                                            <Icon name='Clock' size='16' />
                                            {row.original.horaInicio} <Icon name="ArrowRight" className={"w-3"} /> {row.original.horaFin}
                                        </span>
                                        {/* <span className="flex items-center gap-1 text-xs p-2 rounded-full bg-custom-gray-default dark:bg-custom-blackLight w-fit whitespace-nowrap">
                                            <Icon name='Building' size='16' />
                                            {row.original.centro.nombre} - <span className="font-bold">{row.original.centro.empresa.nombre}</span>
                                        </span> */}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex flex-col gap-1.5">
                                    <section className="flex flex-row items-center gap-2 text-sm">
                                        <div
                                            className="inline-block min-w-4 w-4 min-h-4 h-4 rounded-sm"
                                            style={{ backgroundColor: row.original.color }}
                                        />
                                        <p>{row.original.nombre}</p>
                                    </section>
                                    <section className="flex flex-row items-center gap-2 text-sm">
                                        <Icon name='Clock' size='16' className="text-custom-orange" />
                                        {row.original.horaInicio} <Icon name="ArrowRight" className={"w-3"} /> {row.original.horaFin}
                                    </section>
                                        <span className="flex flex-row gap-2 text-sm">
                                            <Icon name='Building' size='16' className="text-custom-orange" />
                                        {row.original.centro.nombre} - <span className="font-bold">{row.original.centro.empresa.nombre}</span>
                                    </span>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                accessorFn: (row) => `${row.primerApellido} ${row.segundoApellido}, ${row.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "centro",
                title: "Centro",
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
                cell: ({ row }) => row.original.centro.nombre,
                accessorFn: (row) => row.centro.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const centro = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        centro.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "centro.empresa",
                title: "Empresa",
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
                cell: ({ row }) => row.original.centro.empresa.nombre,
                accessorFn: (row) => row.centro.empresa.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const empresa = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        empresa.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}