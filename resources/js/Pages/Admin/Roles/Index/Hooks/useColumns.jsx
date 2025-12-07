import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "role",
                title: "Nombre del rol",
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
                cell: ({ row }) => <span>{row.original.name}</span>,
                accessorFn: (row) => `${row.name}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "description",
                title: "Descripción",
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
                cell: ({ row }) => <span>{row.original.description || 'No hay descripción'}</span>,
                accessorFn: (row) => `${row.description}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const descripcion = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        descripcion.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "users_count",
                title: "Usuarios con rol",
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
                cell: ({ row }) => <span>{row.original.users_count || 'N/A'}</span>,
                accessorFn: (row) => `${row.users_count}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const usersCount = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        usersCount.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "permissions_count",
                title: "Permisos del rol",
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
                cell: ({ row }) => <span>{row.original.permissions_count || 'N/A'}</span>,
                accessorFn: (row) => `${row.permissions_count}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const permissionsCount = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        permissionsCount.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];
        return columnsDefinition;
    }, []); // Dependencia del useMemo
}