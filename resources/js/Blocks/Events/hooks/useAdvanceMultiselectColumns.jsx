import UserAvatar from "../Components/UserAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowActionsColumn } from "@/Components/App/AdvanceMultiselect/Components/Columns/RowActionsColumn";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";

export function useAdvanceMultiselectColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "user",
                title: "Usuario",
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
                cell: ({ row }) => <UserAvatar user={row.original} />,
                accessorFn: (row) => row.name || row.email,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const username = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        username?.toLowerCase().includes(value.toLowerCase())
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
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.email}
                    </span>
                ),
                accessorFn: (row) => row.email,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const email = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        email?.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },            {
                id: "roles",
                title: "Roles",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <ColumnFilter
                        key={`filter${column.id}`}
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.roles}
                    </span>
                ),
                accessorFn: (row) => row.roles,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const roles = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        roles?.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "status",
                title: "Estado",
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.status}
                    </span>
                ),
                accessorFn: (row) => row.status,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const status = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        status?.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "role",
                title: "Rol",
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.role?.name || 'Sin rol'}
                    </span>
                ),
                accessorFn: (row) => row.role?.name || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const roleName = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        roleName?.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
                
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}