import { Table } from "@/Components/ui/table";
import Toolbar from "./Components/Toolbar/Toolbar";
import TableBody from "./Components/Table/TableBody";
import TableDebugging from "../Components/Table/TableDebugging";
import { useDataTable } from "../Context/DataTableContext";

export function DataTableLite({ }) {
    const { customToolbar } = useDataTable();
    const ToolbarComponent = customToolbar || Toolbar;

    return (
        <>
            <div className="flex flex-col rounded-md border border-none">
                <ToolbarComponent />
                <Table>
                    <TableBody />
                </Table>
            </div>
            <TableDebugging />
        </>
    )
}