import UserAvatar from "../UserAvatar";

import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
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
                header: ({ column }) => (
                    <AdvancedHeader
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
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}