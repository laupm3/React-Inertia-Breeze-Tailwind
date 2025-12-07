import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/Components/ui/tooltip";
import ArrayCellPreview from "@/Components/App/DataTable/Components/Columns/Components/ArrayCellPreview";
import SortHeader from "@/Components/App/DataTable/Components/Header/Partials/SortHeader";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "departamento",
                title: "Departamentos",
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
                id: "empleados",
                title: "Nº Empleados",
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
                    <div className="w-full text-center">
                        {row.original.contratosVigentes?.length || 0}
                        &nbsp; empleados
                    </div>
                ),
                accessorFn: (row) => row.contratosVigentes?.length || 0,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const numeroContratos = row.getValue(columnId);
                    return selectedValues.some((value) => numeroContratos === value);
                }
            },
            {
                id: "manager",
                title: "Mánager",
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
                    <div className="flex items-center gap-2 max-w-[12rem]">
                        <img
                            className="w-8 h-8 rounded-full"
                            src={row.original.manager?.user?.profile_photo_url || '/default-avatar.png'}
                            alt={row.original.manager?.nombreCompleto || 'Sin manager'}
                        />
                        <span className="text-nowrap text-ellipsis overflow-hidden">
                            {row.original.manager?.nombreCompleto || 'Sin manager'}
                        </span>
                    </div>
                ),
                accessorFn: (row) => row.manager?.nombreCompleto || '',
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
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 max-w-[12rem]">
                        <img
                            className="w-8 h-8 rounded-full"
                            src={row.original.adjunto?.user?.profile_photo_url || '/default-avatar.png'}
                            alt={row.original.adjunto?.nombreCompleto || 'Sin adjunto'}
                        />
                        <span className="text-nowrap text-ellipsis overflow-hidden">
                            {row.original.adjunto?.nombreCompleto || 'Sin adjunto'}
                        </span>
                    </div>
                ),
                accessorFn: (row) => row.adjunto?.nombreCompleto || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
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
                // Filtro personalizado para verificar si alguno de los empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreCentros = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreCentros.some((empresa) => empresa.includes(value.toLowerCase()));
                    });
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
            {
                id: "parentDepartment",
                title: "Departamento Padre",
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
                cell: ({ row }) => {
                    return (
                        row.original.parentDepartment
                            ? (
                                <span>{row.original.parentDepartment.nombre}</span>
                            )
                            : (
                                <span className="text-gray-400 italic">No asignado</span>
                            )
                    )
                },
                accessorFn: (row) => row.parentDepartment?.nombre ?? 'No asignado',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreDepartamentoPadre = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nombreDepartamentoPadre.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "childDepartments",
                title: "Departamentos Hijos",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(departamento) => departamento.nombre}
                        valueFn={(departamento) => departamento.nombre}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <ArrayCellPreview
                        items={row.original.childDepartments || []}
                        labelFn={d => d.nombre}
                        maxToShow={4}
                        badgeFn={count => (
                            <span className="bg-green-200 text-green-800 px-1 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                                +{count} más
                            </span>
                        )}
                        separator=", "
                    />
                ),
                accessorFn: (row) => {
                    if (!row.childDepartments) return [];
                    return row.childDepartments.map(departamento => departamento.nombre.toLowerCase())
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreDepartamentosHijos = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreDepartamentosHijos.some((departamento) => departamento.includes(value.toLowerCase()));
                    });
                }
            },
            rowActionsColumn
        ];
        return columnsDefinition;
    }, []); // Dependencia del useMemo
}