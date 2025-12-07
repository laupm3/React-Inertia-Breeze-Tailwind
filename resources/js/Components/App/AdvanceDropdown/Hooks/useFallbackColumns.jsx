import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";

export function useFallbackColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            {
                id: "values",
                title: "Values",
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
                cell: ({ row }) => <span>Registro: {row.id}</span>,
                accessorFn: (row) => row.id,
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}