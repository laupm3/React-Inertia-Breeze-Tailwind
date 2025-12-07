import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import RowActionsTrigger from "../../../../../Components/App/DataTable/Components/Columns/Components/RowActionsTrigger";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "modulo",
                title: "Modulo",
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

                    const name = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        name.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "permisos",
                title: "Permisos",
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
                cell: ({ row }) => {
                    return (
                        <div className='flex flex-col'>
                            {row.original.permissions.map((permiso, index) => (
                                <div key={permiso.id} className='relative flex flex-col md:flex-row items-center justify-between gap-6'>
                                    <div className='flex flex-col mb-2'>
                                        <span className='font-bold md:text-nowrap'>
                                            {permiso.name}
                                        </span>
                                        <span className='text-xs md:text-nowrap'>
                                            - {permiso.description}
                                        </span>
                                    </div>

                                    <div className={`
                                        flex items-center w-full mb-4 md:mb-0 border-t border-dashed border-custom-black/20 dark:border-custom-white/20
                                        ${index === row.original.permissions.length - 1 && 'hidden md:flex'}
                                        md:justify-end
                                        `}
                                    />

                                    <div className='absolute top-0 right-0 md:flex md:static md:order-last'>
                                        <RowActionsTrigger model={permiso} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                },
                accessorFn: (row) => [row.name, ...row.permissions.map(permission => permission.name)].join(', '),
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const permisos = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        permisos.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}