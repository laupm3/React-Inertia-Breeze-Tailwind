import { Table } from "@/Components/ui/table";
import TableHeader from "../Components/Table/TableHeader";
import Toolbar from "../Components/Toolbar/Toolbar";
import TableBody from "../Components/Table/TableBody";
import TablePagination from "../Components/Table/TablePagination";
import TableDebugging from "../Components/Table/TableDebugging";
import { useDataTable } from "../Context/DataTableContext";

export function DataTable({ children, hideHeader = false, simplified = false }) {
    const { table, columns, customToolbar, entity } = useDataTable();
    const ToolbarComponent = customToolbar || Toolbar;

    const isHorariosTable = columns?.some(column => column?.accessorKey?.endsWith('-horarios-stadistics'));

    const mobileSimpleColumns = isHorariosTable

    return (
        <div className="">
            <ToolbarComponent simplified={simplified} entity={entity}>
                {children}
            </ToolbarComponent>
            <div className="max-h-[65vh] flex rounded-md md:border">
                <Table>
                    {!hideHeader && <TableHeader mobileSimpleColumns={mobileSimpleColumns} />}
                    <TableBody mobileSimpleColumns={mobileSimpleColumns} />
                </Table>
            </div>
            <TablePagination />
            <TableDebugging />
        </div>
    )
}