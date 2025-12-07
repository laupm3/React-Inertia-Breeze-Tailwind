import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import Icon from '@/imports/LucideIcon';
import { Button } from '@/Components/ui/button';
import { useTranslation } from 'react-i18next';

export function DataTable({ columns: columnsProp, records, toolbarComponent: ToolbarComponent, entity = 'empleados' }) {
    const { t } = useTranslation(['datatable']);
    const columns = columnsProp(t);

    const columnsHidden = columns.filter(column => column.isHidden)?.reduce((acc, column) => {
        acc[column.accessorKey] = false;
        return acc;
    }, {}) || {};

    // Convertir el array de columnas en un objeto con las columnas ocultas

    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState(columnsHidden);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const memoizedData = useMemo(() => records, [records]);

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        autoResetExpanded: false,
        autoResetPageIndex: false,
    });

    /**
     * Renderiza el encabezado de la tabla, mostrando los nombres de las columnas, etc.
     * 
     * @returns {JSX.Element}
     */
    const renderTableHeader = () => (
        <TableHeader className='bg-custom-gray-default dark:bg-custom-blackSemi'>
            {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.filter(header => !header.isPlaceholder).map(header => (
                        <TableHead key={header.id}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    );

    /**
     * Renderiza el contenido de la tabla, mostrando los datos de cada fila
     * 
     * @returns {JSX.Element}
     */
    const renderTableBody = () => (
        <TableBody >
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        {t('datatable.noResults')}
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );

    /**
     * Renderiza la paginación de la tabla, mostrando el número de página actual y el total de páginas
     * 
     * @returns {JSX.Element}
     */
    const renderPagination = () => (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} {t('datatable.of')} {table.getFilteredRowModel().rows.length} {t('datatable.rowsSelected')}.
            </div>
            <Button
                variant="secondary"
                size="sm"
                className='bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <Icon name='ChevronLeft' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
            </Button>
            <div className="flex justify-between text-sm text-muted-foreground py-2">
                <span>
                    {t('datatable.page')} {pagination.pageIndex + 1} {t('datatable.of')} {table.getPageCount()}
                </span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                className='bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <Icon name='ChevronRight' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
            </Button>
        </div>
    );

    return (
        <div className="border-4 rounded-2xl border-gray-200 dark:border-custom-gray-semiDark my-4 pt-4 pl-4 pr-4 pb-0.5 max-h-screen">
            {ToolbarComponent && <ToolbarComponent table={table} entity={entity} />}
            <div className="flex rounded-md border max-h-[calc(100vh-22rem)] overflow-y-auto">
                <Table >
                    {renderTableHeader()}
                    {renderTableBody()}
                </Table>
            </div>
            {renderPagination()}
        </div>
    );
}
