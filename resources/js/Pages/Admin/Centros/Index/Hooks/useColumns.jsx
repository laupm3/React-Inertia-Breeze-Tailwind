import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import STATUS_CENTRO_COLOR_MAP from "@/Components/App/Pills/constants/StatusCentroMapColor";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "nombre",
                title: "Nombre centro",
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
                cell: ({ row }) => <span>{row.original.nombre}</span>,
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
                id: "empresa",
                title: "Empresa",
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
                cell: ({ row }) => <span>{row.original.empresa.siglas}</span>,
                accessorFn: (row) => row.empresa.siglas,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const siglas = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        siglas.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "direccion",
                title: "Dirección",
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
                    <div
                        className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[250px]"
                    >
                        {row.original.direccion.full_address}
                    </div>
                ),
                accessorFn: (row) => row.direccion.full_address,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "email",
                title: "Email",
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
                    <div className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[250px]">
                        {row.original.email}
                    </div>
                ),
                accessorFn: (row) => row.email,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "telefono",
                title: "Teléfono",
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
                cell: ({ row }) => <span>{row.original.telefono}</span>,
                accessorFn: (row) => row.telefono,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "estado",
                title: "Estado",
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
                    <Pill
                        identifier={row.original.estado.nombre}
                        children={row.original.estado.nombre}
                        mapColor={STATUS_CENTRO_COLOR_MAP}
                        size="text-xs"
                        textClassName="font-medium"
                    />
                ),
                accessorFn: (row) => row.estado.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estadoCentro = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        estadoCentro.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "responsable",
                title: "Responsable",
                enableHiding: false,
                enableSorting: false,
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.responsable} />,
                accessorFn: (row) => `${row.responsable.primerApellido} ${row.responsable.segundoApellido}, ${row.responsable.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "coordinador",
                title: "Coordinador",
                enableHiding: false,
                enableSorting: false,
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.coordinador} />,
                accessorFn: (row) => `${row.coordinador.primerApellido} ${row.coordinador.segundoApellido}, ${row.coordinador.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}