import '../css/styles.css';
import { useView } from "../Context/ViewContext";

import Icon from '@/imports/LucideIcon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";

export function useColumns({ content = () => { }, filter = () => { } }) {
    const { handleSheetView, handleCreateUpdateView, } = useView();

    return useMemo(() => {
        const columnsDefinition = [
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
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex flex-col w-full h-full gap-4 cursor-pointer adminPanelTable">
                                {content(row.original)}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="dark:bg-custom-blackSemi"
                            onClick={(e => e.stopPropagation())
                            }
                        >
                            <DropdownMenuItem onClick={() => handleSheetView(row.original)}>
                                <Icon name="Info" className="w-4 mr-2" /> Información
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateUpdateView(row.original)}>
                                <Icon name="SquarePen" className="w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                accessorFn: (row) => filter(row),
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                },
                sortingFn: (rowA, rowB, columnId) => {
                    const a = rowA.getValue(columnId) || "";
                    const b = rowB.getValue(columnId) || "";
                    return a.localeCompare(b, 'es', { sensitivity: 'base' });
                }
            },
            {
                id: "company_name",
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
                        labelFn={(company_name) => `${company_name}`}
                        valueFn={(company_name) => company_name || 'N/A'}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => row.company_name?.toLowerCase() || '',
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreEmpresa = row.getValue(columnId);

                    return selectedValues.some((value) =>
                        nombreEmpresa.includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "department_name",
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
                        labelFn={(department_name) => `${department_name}`}
                        valueFn={(department_name) => department_name || 'N/A'}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => row.department_name?.toLowerCase() || '',
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreDepartamento = row.getValue(columnId);

                    return selectedValues.some((value) =>
                        nombreDepartamento.includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "center_name",
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
                        labelFn={(center_name) => `${center_name}`}
                        valueFn={(center_name) => center_name || 'N/A'}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => row.center_name?.toLowerCase() || '',
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreCentro = row.getValue(columnId);

                    return selectedValues.some((value) =>
                        nombreCentro.includes(value.toLowerCase())
                    );
                }
            },
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}