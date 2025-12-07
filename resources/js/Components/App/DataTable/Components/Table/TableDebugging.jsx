import { useDataTable } from "../../Context/DataTableContext";

export default function TableDebugging() {

    const { table, debug } = useDataTable();

    if (!debug) {
        return null;
    }

    return (
        <>
            <pre>
                {JSON.stringify(
                    { columnFilters: table.getState().columnFilters },
                    null,
                    2
                )}
            </pre>
            <pre>
                {JSON.stringify(
                    { columnVisibility: table.getState().columnVisibility },
                    null,
                    2
                )}
            </pre>
            <pre>
                {JSON.stringify(
                    { sorting: table.getState().sorting },
                    null,
                    2
                )}
            </pre>
            <pre>
                {JSON.stringify(
                    { rowSelection: table.getState().rowSelection },
                    null,
                    2
                )}
            </pre>
            <pre>
                {JSON.stringify(
                    { getFilteredRowModel: table.getFilteredRowModel().rows.map(row => row.id) },
                    null,
                    2
                )}
            </pre>
            <pre>
                {JSON.stringify(
                    { getSortedRowModel: table.getSortedRowModel().rows.map(row => row.id) },
                    null,
                    2
                )}
            </pre>
        </>
    )
}