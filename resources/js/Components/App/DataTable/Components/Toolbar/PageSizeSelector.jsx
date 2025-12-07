import { useTranslation } from "react-i18next";
import { useDataTable } from "../../Context/DataTableContext"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useMemo, useCallback, memo } from "react";

// Componente memoizado para cada ítem del menú de tamaño de página
const PageSizeItem = memo(function PageSizeItem({ size, currentSize, totalRows, onSizeChange }) {
    const isTotal = size === 'all';
    const actualSize = isTotal ? totalRows : size;
    const isSelected = actualSize === currentSize;

    const handleCheckedChange = useCallback(() => {
        onSizeChange(actualSize);
    }, [onSizeChange, actualSize]);

    return (
        <DropdownMenuCheckboxItem
            checked={isSelected}
            onCheckedChange={handleCheckedChange}
            className={`focus:bg-custom-gray-semiLight ${isSelected ? "bg-custom-gray-dark text-white" : ""}`}
        >
            {isTotal ? `Total (${totalRows})` : size}
        </DropdownMenuCheckboxItem>
    );
});

/**
 * Componente que permite al usuario seleccionar cuántos elementos mostrar por página en una tabla.
 * 
 * Este componente forma parte de la barra de herramientas de la tabla de datos y permite
 * cambiar dinámicamente el número de filas visibles por página. Utiliza un menú desplegable
 * que muestra las opciones disponibles configuradas en el contexto DataTable.
 * 
 * @returns {JSX.Element} Un componente de selección de tamaño de página
 */
function PageSizeSelector() {
    const { table, pageSizeOptions, totalRows } = useDataTable();
    const pageSize = table.getState().pagination.pageSize;
    const { t } = useTranslation(['datatable']);

    // Memoización de la función para cambiar el tamaño de página
    const handlePageSizeChange = useCallback((newPageSize) => {
        table.setPageSize(Number(newPageSize));
    }, [table]);

    // Memoización de las opciones de tamaño de página filtradas
    const pageSizeOptionsMemo = useMemo(() => {
        return pageSizeOptions.filter(option => option <= totalRows && option !== totalRows);
    }, [pageSizeOptions, totalRows]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                >
                    <span>{t('tables.paginador')}: {pageSize}</span>
                    <Icon name="ChevronDown" className="w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-custom-gray-default dark:bg-custom-blackLight"
            >
                {/* Opciones normales de tamaño de página */}
                {pageSizeOptionsMemo.map((pageSizeOption) => (
                    <PageSizeItem
                        key={pageSizeOption}
                        size={pageSizeOption}
                        currentSize={pageSize}
                        onSizeChange={handlePageSizeChange}
                        totalRows={totalRows}
                    />
                ))}

                {/* Opción "Total" */}
                <PageSizeItem
                    key="all"
                    size="all"
                    currentSize={pageSize}
                    onSizeChange={handlePageSizeChange}
                    totalRows={totalRows}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

PageSizeItem.displayName = 'PageSizeItem';

export default memo(PageSizeSelector);