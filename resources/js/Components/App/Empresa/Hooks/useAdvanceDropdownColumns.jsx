import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowActionsColumn } from "@/Components/App/AdvanceDropdown/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";
import EmpleadoAvatar from "../../Empleado/EmpleadoAvatar";

export function useAdvanceDropdownColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "nombre",
                title: "Nombre empresa",
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

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "siglas",
                title: "Siglas",
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
                cell: ({ row }) => <span>{row.original.siglas}</span>,
                accessorFn: (row) => row.siglas,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "cif",
                title: "CIF",
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
                cell: ({ row }) => <span>{row.original.cif}</span>,
                accessorFn: (row) => row.cif,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "direccion",
                title: "Dirección fiscal",
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
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{row.original.email}</span>,
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
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
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
                id: "representante",
                title: "Representante",
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.representante} />,
                accessorFn: (row) => `${row.representante.primerApellido} ${row.representante.segundoApellido}, ${row.representante.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "adjunto",
                title: "Adjunto",
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.adjunto} />,
                accessorFn: (row) => `${row.adjunto.primerApellido} ${row.adjunto.segundoApellido}, ${row.adjunto.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "centros",
                title: "Centros",
                enableHiding: false,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(centro) => `${centro.nombre}`}
                        valueFn={(centro) => centro.nombre}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.centros) return [];
                    return row.centros.map(centro => centro.nombre.toLowerCase())
                },
                // Filtro personalizado para verificar si alguno de los centros coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreCentros = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreCentros.some((centro) => centro.includes(value.toLowerCase()));
                    });
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}