import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useDataTable } from "../../Context/DataTableContext";
import { useTranslation } from "react-i18next";

export default function TablePagination() {

    const { table } = useDataTable();
    const { pagination } = table.getState('pagination');

    const { t } = useTranslation(['datatable']);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between space-x-2 py-4 w-full">
            <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} {t('datatable.of')} {table.getFilteredRowModel().rows.length} {t('datatable.rowsSelected')}.
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <Icon name='ChevronLeft' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                </Button>
                <div className="flex justify-between text-sm text-muted-foreground py-2">
                    {t('datatable.page')} {pagination.pageIndex + 1} {t('datatable.of')} {table.getPageCount()}
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <Icon name='ChevronRight' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                </Button>
            </div>
        </div>
    )
}