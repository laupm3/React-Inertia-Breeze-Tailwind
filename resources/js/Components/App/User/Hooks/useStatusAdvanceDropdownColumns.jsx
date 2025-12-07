import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowCheckedColumn } from "@/Components/App/DataTable/Components/Columns/RowCheckedColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_USUARIO_COLOR_MAP from "@/Components/App/Pills/constants/StatusUsuarioMapColor";

export function useStatusAdvanceDropdownColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowCheckedColumn,
            {
                id: "estado",
                title: "Estado usuario",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                    />
                ),
                cell: ({ row }) => (
                    <Pill
                        identifier={row.original.name}
                        children={row.original.label}
                        mapColor={STATUS_USUARIO_COLOR_MAP}
                        size="text-xs"
                        textClassName="font-medium"
                    />
                ),
                accessorFn: (row) => `${row.label}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const status = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        status.toLowerCase() === value.toLowerCase()
                    );
                }
            }
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}