import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import ContratosVinculadosTrigger from "../../Components/ContratosVinculadosTrigger";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "nombre",
                title: "Nombre asignación",
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
                id: "descripcion",
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
                cell: ({ row }) => row.original.descripcion,
                accessorFn: (row) => row.descripcion,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const descripcion = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        descripcion.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "contratosVinculados",
                title: "Contratos vinculados",
                enableHiding: true,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => <span className="text-center">Contratos vinculados</span>,
                cell: ({ row }) => <ContratosVinculadosTrigger asignacion={row.original} />
            },
            {
                id: "contratosVigentes",
                title: "Empleados",
                enableHiding: false,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(contratoVigente) => <EmpleadoAvatar empleado={contratoVigente.empleado} />}
                        valueFn={(contratoVigente) => contratoVigente.empleado.id}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.contratosVigentes) return [];
                    return row.contratosVigentes.map(contratoVigente => contratoVigente.empleado.id);
                },
                // Filtro personalizado para verificar si alguno de los contratos vigentes está en la lista de valores seleccionados
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const empleadosIds = row.getValue(columnId);
                    return selectedValues.some((value) => {
                        return empleadosIds.includes(value);
                    });
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}