import { useState } from "react";
import {
    TableBody as BaseTableBody,
    TableCell,
    TableRow
} from "@/Components/ui/table";

import { useDataTable } from "../../Context/DataTableContext";

import TableBodyMobile from "./partials/TableBodyMobile";
import TableBodyDesktop from "./partials/TableBodyDesktop";
import { useSidebar } from "@/Components/ui/sidebar";

/**
 * @component TableBody
 * 
 * @description
 * Componente que renderiza el cuerpo de una tabla de datos utilizando TanStack Table.
 * Obtiene los datos de la tabla del contexto DataTableContext.
 * Muestra las filas y celdas según el modelo de datos proporcionado por la instancia de tabla.
 * Si no hay filas disponibles, muestra un mensaje indicando que no hay resultados.
 * 
 * @returns {JSX.Element} Un componente TableBody que contiene filas y celdas de la tabla
 * o un mensaje cuando no hay datos disponibles.
 */
export default function TableBody({ mobileSimpleColumns = false }) {
    const {
        isMobile
    } = useSidebar();

    const { table, columns } = useDataTable();
    const [selectedCell, setSelectedCell] = useState(null);

    const hasRows = table.getRowModel().rows.length > 0;

    return (
        hasRows ? (
            (!isMobile || mobileSimpleColumns) ? (
                <TableBodyDesktop table={table} mobileSimpleColumns={mobileSimpleColumns} />
            ) : (
                <TableBodyMobile table={table} columns={columns} selectedCell={selectedCell} setSelectedCell={setSelectedCell} />
            )
        ) : (

            <BaseTableBody>
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                        No hay resultados
                    </TableCell>
                </TableRow>
            </BaseTableBody>
        )
    )
}