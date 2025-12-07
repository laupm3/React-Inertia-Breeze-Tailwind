import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import { useView } from "../Context/ViewContext";
import RowActionsTrigger from "@/Components/App/DataTable/Components/Columns/Components/RowActionsTrigger";

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
                    <div className="flex gap-2 justify-start items-center">
                        <div
                            className='w-5 h-5 rounded-md mr-2'
                            style={{ backgroundColor: row.original.color }}
                        />
                        {row.original.nombre}
                    </div>
                ),
                accessorFn: (row) => `${row.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombre = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nombre.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "horarios",
                title: "Horarios",
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
                    <span>
                        {row.original.horaInicio} - {row.original.horaFin}
                    </span>
                ),
                accessorFn: (row) => `${row.horaInicio} - ${row.horaFin}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const horarios = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        horarios.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "descansos",
                title: "Descansos",
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
                    <span>
                        {`${(row.original.descansoInicio)
                            ? `${row.original.descansoInicio} - ${row.original.descansoFin}`
                            : 'Sin descanso'
                            }`
                        }
                    </span>
                ),
                accessorFn: (row) => `${row.descansoInicio} - ${row.descansoFin}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const descansos = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        descansos.toLowerCase().includes(value.toLowerCase())
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
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{row.original.centro.nombre}</span>,
                accessorFn: (row) => `${row.centro.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const centro = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        centro.toLowerCase().includes(value.toLowerCase())
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