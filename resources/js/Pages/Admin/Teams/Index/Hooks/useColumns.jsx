import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import { useView } from "../Context/ViewContext";
import RowActionsTrigger from "@/Components/App/DataTable/Components/Columns/Components/RowActionsTrigger";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";

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
                cell: ({ row }) => <span>{row.original.name}</span>,
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
                id: "creador",
                title: "Creador",
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
                    <div className="flex items-center gap-2">
                        <img
                            src={row.original.owner?.profile_photo_url}
                            alt={row.original.owner?.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <span>{row.original.owner?.name}</span>
                    </div>
                ),
                accessorFn: (row) => row.owner?.name,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const creador = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        creador.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "usuarios",
                title: "Miembros",
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
                cell: ({ row }) => <span className="block text-center">{row.original.users?.length || 0}</span>,
                accessorFn: (row) => row.users?.length || 0,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const usuarios = row.getValue(columnId);
                    return selectedValues.some((value) => {
                        const numValue = parseInt(value);
                        return usuarios === numValue;
                    });
                }
            },
            {
                id: "invitaciones_pendientes",
                title: "Invitaciones pendientes",
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
                cell: ({ row }) => <span className="block text-center">{row.original.teamInvitations?.length || 0}</span>,
                accessorFn: (row) => row.teamInvitations?.length || 0,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const invitaciones_pendientes = row.getValue(columnId);
                    return selectedValues.some((value) => {
                        const numValue = parseInt(value);
                        return invitaciones_pendientes === numValue;
                    });
                }
            },
            rowActionsColumn
        ];
        return columnsDefinition;
    }, []); // Dependencia del useMemo
}