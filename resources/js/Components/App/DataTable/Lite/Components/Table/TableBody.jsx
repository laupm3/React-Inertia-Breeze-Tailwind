import {
    TableBody as BaseTableBody,
    TableCell,
    TableRow
} from "@/Components/ui/table";

import { useDataTable } from "../../../Context/DataTableContext";
import { flexRender } from "@tanstack/react-table";

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
export default function TableBody({ }) {

    const { table, columns } = useDataTable();

    const hasRows = table.getRowModel().rows.length > 0;

    return (
        <BaseTableBody>
            {hasRows ? (
                table.getRowModel().rows
                    .map(row => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="border-none p-2 cursor-pointer"
                            onClick={row.getToggleSelectedHandler()}
                        >
                            {row.getVisibleCells()
                                .map(cell => (
                                    <TableCell key={cell.id} className="border-none p-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                        </TableRow>
                    ))
            ) : (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                        No hay resultados
                    </TableCell>
                </TableRow>
            )}
        </BaseTableBody>
    )
}