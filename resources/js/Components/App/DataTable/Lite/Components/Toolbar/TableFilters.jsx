import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useState } from "react";
import { useDataTable } from "../../../Context/DataTableContext";
import { Button } from "@/Components/App/Buttons/Button";

export default function TableFilters() {
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    const { table, filterColumns } = useDataTable();

    const { columnFilters } = table.getState();

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
                        className="bg-hidden border-none p-0"
                    >
                        <div className="relative flex items-center justify-center p-0 rounded-full">
                            <Icon name="SlidersHorizontal" className="w-5 text-custom-orange" />
                            {columnFilters.length > 0 && (
                                <div
                                    className="absolute w-[0.425rem] h-[0.425rem] -top-[0.225rem] -right-[0.325rem] bg-custom-blackLight rounded-full dark:bg-custom-white"
                                />
                            )}
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="bg-custom-white dark:bg-custom-blackSemi rounded-xl border border-custom-gray-light dark:border-custom-gray shadow-lg"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 sm:p-4">
                            <h4 className="text-lg font-semibold text-custom-blackLight dark:text-custom-white">
                                Filtros
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-custom-blue dark:text-custom-gray-dark hover:bg-custom-gray-light dark:bg-transparent dark:hover:bg-custom-gray-sidebar rounded-md px-2"
                                onClick={handleResetColumnFilters}
                            >
                                Borrar filtros
                            </Button>
                        </div>
                        
                        {/* Filters Content */}
                        <div className="flex flex-col gap-y-3 px-3 sm:px-4 pb-3 sm:pb-4 max-h-[50vh] sm:max-h-[400px] overflow-y-auto w-full">
                            {Object.keys(filterColumns).map((columnId) => {
                                const column = table.getColumn(columnId);
                                return (
                                    <div 
                                        key={columnId} 
                                        className="w-full block"
                                    >
                                        <div className="w-full [&>*]:w-full [&>*]:min-w-full">
                                            {column.columnDef.header({ 
                                                column,
                                                className: "w-full min-w-full" 
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Footer with action buttons - Ocultos para evitar duplicación */}
                        <div className="hidden justify-end gap-2 p-3 sm:p-4 border-t border-custom-gray-light dark:border-custom-gray">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-custom-blackLight dark:text-custom-white border-custom-gray dark:border-custom-gray hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium rounded-full"
                                onClick={() => setIsFilterMenuOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-custom-orange hover:bg-custom-orange/90 text-white rounded-full"
                                onClick={() => setIsFilterMenuOpen(false)}
                            >
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    );
}
