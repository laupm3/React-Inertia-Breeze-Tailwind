import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/Components/ui/dialog";
import { DataTableLite } from "@/Components/App/DataTable/Lite/DataTableLite";
import { DataTableContextProvider } from "@/Components/App/DataTable/Context/DataTableContext";
import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";
import CreateButton from "../Components/CreateButton";
import InputSkeleton from "@/Components/App/Skeletons/InputSkeleton";
import SelectionButton from "../Components/SelectionButton";
import { useAdvanceDropdown } from "../Context/AdvanceDropdownContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFallbackColumns } from "../Hooks/useFallbackColumns";

export default React.memo(function AdvanceDropdownPortal({
    columns,
    showCreateButton = false,
    openInDialog = false,
}) {
    const { data, loading, error } = useDataHandler();
    const viewContext = useView();
    const fallbackColumns = useFallbackColumns();
    const { selection, handleRowSelectionChange, getItemId } = useAdvanceDropdown();

    const [isOpen, setIsOpen] = useState(false);

    const columnsDef = useMemo(() => {
        return columns || fallbackColumns;
    }, [columns, fallbackColumns]);

    const dataId = useMemo(() => `data-${data?.length || 0}-${Date.now()}`, [data]);

    const handleRowSelectionWithUiEffect = useCallback(
        (newSelection) => {
            const wasSelected = handleRowSelectionChange(newSelection);
            if (wasSelected) {
                setIsOpen(false);
            }
        },
        [handleRowSelectionChange]
    );

    useEffect(() => {
        if (selection.value) {
            setIsOpen(false);
        }
    }, [selection.value]);

    const showLoading = loading || (data && data.length === 0);

    if (showLoading) return <InputSkeleton />;

    if (error) {
        return (
            <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
                Error al cargar datos: {error}
            </div>
        );
    }

    const Content = (
        <div className="flex flex-col gap-2 w-80 sm:w-full px-3 py-2 rounded-xl dark:dark-scrollbar dark:bg-custom-blackSemi max-h-[500px] bg-custom-white">
            <div className="w-full max-h-[450px] overflow-y-auto dark:dark-scrollbar">
                <DataTableLite />
            </div>
            {showCreateButton && <CreateButton />}
        </div>
    );

    return (
        <DataTableContextProvider
            key={dataId}
            data={data}
            columnsDef={columnsDef}
            config={{
                getRowId: (row) => String(getItemId(row)),
                onRowSelectionChange: handleRowSelectionWithUiEffect,
                enableMultiRowSelection: false,
            }}
            initialState={{
                pagination: {
                    pageIndex: 0,
                    pageSize: data.length,
                },
                rowSelection: selection.rowSelection,
            }}
            viewContext={viewContext}
        >
            {openInDialog ? (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <SelectionButton />
                    </DialogTrigger>
                    <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[70vw] w-full">
                        {Content}
                    </DialogContent>
                </Dialog>
            ) : (
                <Popover open={isOpen} onOpenChange={setIsOpen} modal>
                    <PopoverTrigger asChild>
                        <SelectionButton />
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-0 border-none bg-transparent shadow-none"
                        sideOffset={5}
                        align="start"
                    >
                        {Content}
                    </PopoverContent>
                </Popover>
            )}
        </DataTableContextProvider>
    );
});
