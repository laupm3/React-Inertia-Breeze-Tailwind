import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { rowActionsColumn } from "@/Components/App/AdvanceDropdown/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";

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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original} />,
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
                id: "nif",
                title: "NIF",
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
                cell: ({ row }) => row.original.nif,
                accessorFn: (row) => row.nif,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nif = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nif.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "tipoDocumento",
                title: "Tipo de documento",
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
                cell: ({ row }) => row.original.tipoDocumento.nombre,
                accessorFn: (row) => row.tipoDocumento.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tipoDocumento = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        tipoDocumento.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "estadoEmpleado",
                title: "Estado del empleado",
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
                    <Pill
                        identifier={row.original.estadoEmpleado.nombre}
                        children={row.original.estadoEmpleado.nombre}
                        mapColor={STATUS_EMPLEADO_COLOR_MAP}
                    />
                ),
                accessorFn: (row) => row.estadoEmpleado.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estadoEmpleado = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        estadoEmpleado.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "empresas",
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
                    if (!row.empresas) return [];
                    return row.empresas.map(empresa => empresa.nombre.toLowerCase())
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
                id: "departamentos",
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
                    if (!row.departamentos) return [];
                    return row.departamentos.map(departamento => departamento.nombre.toLowerCase())
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
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}