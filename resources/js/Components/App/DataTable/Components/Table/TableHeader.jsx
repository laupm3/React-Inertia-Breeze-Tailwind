import {
    TableHead,
    TableHeader as BaseTableHeader,
    TableRow
} from "@/Components/ui/table";
import { useDataTable } from "../../Context/DataTableContext";
import { flexRender } from "@tanstack/react-table";
import { useSidebar } from "@/Components/ui/sidebar";

/**
 * Componente TableHeader
 * 
 * Renderiza la sección de encabezados de una tabla de datos utilizando Tanstack Table.
 * Obtiene la configuración de la tabla del contexto DataTableContext y renderiza
 * dinámicamente los encabezados de columnas con soporte para temas claro/oscuro.
 * 
 * @returns {JSX.Element} Componente de encabezado de tabla con los encabezados de columnas configurados
 */
export default function TableHeader({ mobileSimpleColumns = false }) {
    const {
        isMobile
    } = useSidebar();

    const {
        table
    } = useDataTable();

    return (
        <BaseTableHeader className="bg-custom-gray-default dark:bg-custom-blackSemi sticky top-0 z-20">
            {table.getHeaderGroups().map(headerGroup => {
                const headers = headerGroup.headers.filter(header => !header.isPlaceholder);
                const firstStickyId = headers.find(header => header.column.id !== "select")?.column.id;
                const hasSelection = headers.some(header => header.column.id === "select");

                return (
                    <TableRow key={headerGroup.id}>
                        {headers.map(header => {
                            const columnId = header.column.id;
                            const isSelection = columnId === "select";
                            const isFirstSticky = columnId === firstStickyId;
                            const isActions = columnId === "actions";

                            const baseStickyClass = "z-10 bg-custom-gray-default dark:bg-custom-blackSemi";

                            const positionClass = isSelection
                                ? "sticky left-0 pl-0"
                                : isFirstSticky
                                    ? `sticky ${hasSelection ? "left-12" : "left-0"}`
                                    : isActions
                                        ? "sticky right-0"
                                        : "";

                            const visibilityClass = isMobile && columnId !== "select" ? "hidden" : "table-cell";
                            const selectCellClass = columnId === "select" ? "flex flex-row items-center justify-center gap-2" : "";
                            const actionAlignClass = !isMobile && isActions ? "flex justify-center items-center" : "";

                            return (
                                <TableHead
                                    key={header.id}
                                    className={`
                                        ${baseStickyClass}
                                        ${!isMobile && positionClass}
                                        ${!mobileSimpleColumns && visibilityClass}
                                        ${selectCellClass}
                                        ${actionAlignClass}
                                    `}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                );
            })}
        </BaseTableHeader>

    )
} 