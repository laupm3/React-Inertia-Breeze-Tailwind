import { useMemo } from "react";

import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_CENTRO_COLOR_MAP from "@/Components/App/Pills/constants/StatusCentroMapColor";
import { rowActionsColumn } from "../Components/RowActionsColumn";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "nombre plantilla",
                title: "Nombre de plantilla",
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
                cell: ({ row }) => <span>{row.original.name || row.name}</span>,
                accessorFn: (row) => row.name || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombre = row.getValue(columnId) || '';
                    return selectedValues.some((value) =>
                        nombre.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "asunto",
                title: "Asunto",
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
                cell: ({ row }) => <span>{row.original.subject || row.subject}</span>,
                accessorFn: (row) => row.subject || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const asunto = row.getValue(columnId) || '';
                    return selectedValues.some((value) =>
                        asunto.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "emisor plantilla",
                title: "Emisor de Plantilla",
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
                        className="inline-flex flex-col text-ellipsis overflow-hidden whitespace-nowrap max-w-[250px]"
                    >
                        <span>{row.original.sender?.name || ''}</span>
                        <span>({row.original.sender?.email})</span>
                    </div>

                ),
                accessorFn: (row) => row.sender?.name || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId) || '';
                    return selectedValues.some((value) =>
                        rowValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "params",
                title: "Params",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        valueFn={(value) => {
                            if (Array.isArray(value)) {
                                return value.join(', ');
                            }
                            return value || '';
                        }}
                        labelFn={(value) => {
                            if (Array.isArray(value)) {
                                return value.join(', ');
                            }
                            return value || '';
                        }}
                    />
                ),
                cell: ({ row }) => (
                    <div className="max-w-[250px] flex flex-wrap gap-2">
                        {Array.isArray(row.original.params) ? (
                            row.original.params.map((param, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                                >
                                    {`{{${param}}}`}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm">
                                {row.original.params || ''}
                            </span>
                        )}
                    </div>
                ),
                accessorFn: (row) => {
                    if (Array.isArray(row.params)) {
                        return row.params.join(', ');
                    }
                    return row.params || '';
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const rowValue = row.getValue(columnId) || '';
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
                        identifier={row.original?.is_active ? 'Activo' : 'Inactivo'}
                        children={row.original?.is_active ? 'Activo' : 'Inactivo'}
                        mapColor={STATUS_CENTRO_COLOR_MAP}
                        size="text-xs"
                        textClassName="font-medium"
                    />
                ),
                accessorFn: (row) => row.is_active ? 'Activo' : 'Inactivo',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estadoPlantilla = row.getValue(columnId) || '';
                    return selectedValues.some((value) =>
                        estadoPlantilla.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []);
}