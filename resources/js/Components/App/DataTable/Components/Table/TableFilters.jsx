import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useState } from "react";
import { useDataTable } from "../../Context/DataTableContext";
import { Button } from "@/Components/App/Buttons/Button";

export default function TableFilters() {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    const { table, filterColumns } = useDataTable();

    const handleResetColumnFilters = () => {
        table.resetColumnFilters();
        setIsFilterMenuOpen(false);
    }

    return (
        Object.keys(filterColumns).length > 0 && (
            <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} modal={false}>

                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="rounded-full bg-hidden border-none"
                    >
                        {"Filtros"} <Icon name="SlidersHorizontal" className="ml-1 w-5 text-custom-orange" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="bg-custom-gray-default dark:bg-custom-blackLight rounded-2xl"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >

                    <div className="flex flex-col gap-2 p-2 w-full min-w-[20rem] max-w-[20rem]">
                        <div className="flex justify-between items-center w-full">
                            <h4 className="text-lg font-bold">
                                {"Columnas"}
                            </h4>
                            <Button
                                className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full"
                                onClick={handleResetColumnFilters}
                            >
                                {"Borrar Filtros"}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-y-3">
                            {Object.keys(filterColumns).map((columnId) => {
                                const column = table.getColumn(columnId);
                                return (
                                    <div key={columnId}>
                                        {column.columnDef.header({ column })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    );
}
