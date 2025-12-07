import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { DataTableLite } from "@/Components/App/DataTable/Lite/DataTableLite";
import { DataTableContextProvider } from "@/Components/App/DataTable/Context/DataTableContext";
import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";
import CreateButton from "../Components/CreateButton";
import InputSkeleton from "@/Components/App/Skeletons/InputSkeleton";
import SelectionButton from "../Components/SelectionButton";
import { useAdvanceMultiselect } from "../Context/AdvanceMultiselectContext";
import React, { useEffect, useMemo, useState } from "react";
import { useFallbackColumns } from "../Hooks/useFallbackColumns";
import { Button } from "@/Components/App/Buttons/Button";
import CustomToolbar from "../Components/CustomToolbar";

export default React.memo(function AdvanceMultiselectPortal({
    columns,
    showCreateButton = false
}) {
    const { data, loading, error } = useDataHandler();
    const viewContext = useView();
    const fallbackColumns = useFallbackColumns();
    const {
        selection,
        handleRowSelectionChange,
        getItemId,
        resetSelection
    } = useAdvanceMultiselect();

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const columnsDef = useMemo(() => {
        return columns || fallbackColumns;
    }, [columns, fallbackColumns]);

    // Añadir un identificador único que cambie cuando los datos cambien
    const dataId = useMemo(() =>
        `data-${data?.length || 0}-${Date.now()}`,
        [data]
    );

    // Efecto para cerrar el popover cuando cambian los datos (NO por selección)
    useEffect(() => {
        // En multiselección, no cerramos automáticamente por cambios de selección
        // Solo cerramos por cambios de datos o errores
    }, [data]);

    // Estado de carga mejorado
    const showLoading = loading || (data && data.length === 0);

    if (showLoading) {
        return <InputSkeleton />
    }

    // Si hay error, mostrar algún indicador
    if (error) {
        return (
            <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
                Error al cargar datos: {error}
            </div>
        );
    }

    return (
        <DataTableContextProvider
            key={dataId}
            data={data}
            columnsDef={columnsDef}
            // debug={true}
            config={
                {
                    getRowId: (row) => String(getItemId(row)),
                    onRowSelectionChange: handleRowSelectionChange,
                    enableMultiRowSelection: true
                }
            }
            initialState={{
                pagination: {
                    pageIndex: 0,
                    pageSize: data.length,
                },
                rowSelection: selection.rowSelection,
            }}
            viewContext={viewContext}
            customToolbar={CustomToolbar}
        >
            <Popover
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                modal
                className="w-full"
            >
                <PopoverTrigger asChild>
                    <SelectionButton />
                </PopoverTrigger>
                <PopoverContent
                    className="flex flex-col min-w-[350px] p-0 rounded-xl dark:dark-scrollbar dark:bg-custom-blackSemi max-h-[450px] bg-custom-white"
                    sideOffset={5}
                    align="center">
                    
                    <div className="flex-1 max-h-[350px] overflow-y-auto">
                        <DataTableLite />
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex flex-row gap-2 p-2 border-t border-custom-gray-light dark:border-custom-gray">
                        {/* Solo mostrar el botón de creación cuando se habilita */}
                        {showCreateButton && <CreateButton className="flex-1" />}
                        
                        {/* Botón para limpiar selecciones */}
                        <Button
                            onClick={() => resetSelection()}
                            variant="outline"
                            className="flex-1"
                        >
                            Limpiar
                        </Button>
                        
                        {/* Botón para cerrar el popover */}
                        <Button
                            onClick={() => setIsPopoverOpen(false)}
                            variant="default"
                            className="flex-1"
                        >
                            Cerrar
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </DataTableContextProvider>
    )
});