import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowActionsColumn } from "@/Components/App/AdvanceDropdown/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_PERMISO_COLOR_MAP from "@/Components/App/Pills/constants/StatusPermisoMapColor";
import VACACIONES_COLOR_MAP from "@/Components/App/Pills/constants/VacacionesMapColor";

export function useAdvanceDropdownColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "empleado",
                title: "Empleado",
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.empleado} />,
                accessorFn: (row) => `${row.empleado.primerApellido} ${row.empleado.segundoApellido}, ${row.empleado.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "permiso",
                title: "Tipo de permiso",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: false,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <Pill
                        text="Vacaciones"
                        variant={VACACIONES_COLOR_MAP["Vacaciones"] || "default"}
                    />
                ),
                accessorFn: (row) => "Vacaciones",
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fecha_inicio",
                title: "Fecha inicio",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: false,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[150px]'}
                    />
                ),
                cell: ({ row }) => {
                    const fecha = new Date(row.original.fecha_inicio);
                    return fecha.toLocaleDateString('es-ES');
                },
                accessorFn: (row) => row.fecha_inicio,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    const formattedDate = new Date(rowValue).toLocaleDateString('es-ES');
                    return selectedValues.some((value) =>
                        formattedDate.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fecha_fin",
                title: "Fecha fin",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: false,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[150px]'}
                    />
                ),
                cell: ({ row }) => {
                    const fecha = new Date(row.original.fecha_fin);
                    return fecha.toLocaleDateString('es-ES');
                },
                accessorFn: (row) => row.fecha_fin,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    const formattedDate = new Date(rowValue).toLocaleDateString('es-ES');
                    return selectedValues.some((value) =>
                        formattedDate.toLowerCase().includes(value.toLowerCase())
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
                hideColumn: false,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[150px]'}
                    />
                ),
                cell: ({ row }) => (
                    <Pill
                        text={row.original.estado?.nombre || 'Pendiente'}
                        variant={STATUS_PERMISO_COLOR_MAP[row.original.estado?.nombre] || "secondary"}
                    />
                ),
                accessorFn: (row) => row.estado?.nombre || 'Pendiente',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "dia_completo",
                title: "Día completo",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[120px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.original.dia_completo 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                        {row.original.dia_completo ? 'Sí' : 'No'}
                    </span>
                ),
                accessorFn: (row) => row.dia_completo ? 'Sí' : 'No',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "recuperable",
                title: "Recuperable",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[120px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.original.recuperable 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                        {row.original.recuperable ? 'Sí' : 'No'}
                    </span>
                ),
                accessorFn: (row) => row.recuperable ? 'Sí' : 'No',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}
