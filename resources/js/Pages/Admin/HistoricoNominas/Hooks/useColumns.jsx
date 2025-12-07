import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import EmpleadoAvatar from "../Partials/EmpleadoAvatar";

const formatearFecha = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "nombre",
                title: "Nombre de archivo",
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
                cell: ({ row }) => row.original.nombre,
                accessorFn: (row) => row.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombre = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nombre.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "tamaño",
                title: "Tamaño",
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
                cell: ({ row }) => row.original.size,
                accessorFn: (row) => row.size,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tamaño = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        tamaño.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fechaSubida",
                title: "Fecha de subida",
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
                cell: ({ row }) => formatearFecha(row.original.created_at),
                accessorFn: (row) => row.created_at,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fechaSubida = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fechaSubida.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "subidoPor",
                title: "Subido por",
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
                cell: ({ row }) => <EmpleadoAvatar user={row.original.created_by} />,
                accessorFn: (row) => row.created_by.name,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const subidoPor = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        subidoPor.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "vinculadoA",
                title: "Vinculado a",
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
                cell: ({ row }) => <EmpleadoAvatar user={row.original.user} />,
                accessorFn: (row) => row.user.name,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const vinculadoA = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        vinculadoA.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}