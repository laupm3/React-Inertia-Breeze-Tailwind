import { useTranslation } from "react-i18next";
import { useDataTable } from "../../Context/DataTableContext"
import { useMemo, useCallback, memo, useState } from "react";

import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { Button } from "@/Components/App/Buttons/Button";

// Componente para mostrar todas las columnas
const ShowAllColumnsItem = memo(({ hideableColumns, onUpdate, updateKey }) => {
    const handleClick = useCallback(
        (event) => {
            event.stopPropagation();
            
            // Verificar si todas las columnas están visibles
            const visibleCount = hideableColumns.filter(column => column.getIsVisible()).length;
            const allVisible = visibleCount === hideableColumns.length;
            
            // Si todas están visibles, ocultar todas
            // Si no todas están visibles, mostrar todas
            if (allVisible) {
                // Ocultar todas las columnas
                hideableColumns.forEach(column => {
                    if (column.getIsVisible()) {
                        column.toggleVisibility(false);
                    }
                });
            } else {
                // Mostrar todas las columnas
                hideableColumns.forEach(column => {
                    if (!column.getIsVisible()) {
                        column.toggleVisibility(true);
                    }
                });
            }
            
            // Forzar actualización completa
            setTimeout(() => onUpdate(), 0);
        },
        [hideableColumns, onUpdate]
    );

    // Verificar estado actual en cada render (se actualiza con updateKey)
    const visibleCount = hideableColumns.filter(column => column.getIsVisible()).length;
    const allVisible = visibleCount === hideableColumns.length;

    return (
        <DropdownMenuItem
            onClick={handleClick}
            onSelect={(event) => event.preventDefault()}
            className="flex items-center gap-2 cursor-pointer font-medium text-custom-orange hover:text-custom-blue dark:text-custom-white dark:hover:text-custom-white"
        >
            <Icon name={allVisible ? "EyeOff" : "Eye"} className="w-4 h-4" />
            <span>{allVisible ? "Ocultar todas las columnas" : "Mostrar todas las columnas"}</span>
        </DropdownMenuItem>
    );
});

// Componente memoizado para cada ítem del menú
const ColumnVisibilityItem = memo(({ column, updateKey, onUpdate }) => {
    const handleClick = useCallback(
        (event) => {
            event.stopPropagation();
            column.toggleVisibility(!column.getIsVisible());
            // Forzar actualización para sincronizar todos los componentes
            setTimeout(() => onUpdate(), 0);
        },
        [column, onUpdate]
    );

    // Obtener estado directamente de la columna en cada render
    const isVisible = column.getIsVisible();

    return (
        <DropdownMenuItem
            key={`${column.id}-${updateKey}`}
            onClick={handleClick}
            onSelect={(event) => event.preventDefault()}
            className="flex items-center gap-2 cursor-pointer"
        >
            <div className="flex items-center justify-center w-4 h-4 rounded-sm">
                {isVisible && (
                    <Icon name="Check" className="w-3 h-3 text-custom-blackSemi dark:text-custom-white" />
                )}
            </div>
            <span>{column?.columnDef?.title || column.id}</span>
        </DropdownMenuItem>
    );
});

/**
 * Componente que permite al usuario controlar la visibilidad de las columnas en una tabla.
 * 
 * Este componente forma parte de la barra de herramientas de la tabla de datos y ofrece
 * un menú desplegable con casillas de verificación que permiten mostrar u ocultar
 * columnas específicas de la tabla. Utiliza el contexto DataTable para acceder a la
 * configuración de columnas y sus estados de visibilidad.
 * 
 * @returns {JSX.Element} Un componente selector de visibilidad de columnas
 */
function ColumnsVisibilitySelector() {

    const { table } = useDataTable();
    const { t } = useTranslation('datatable');
    const [isOpen, setIsOpen] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    // Memoiza las columnas filtradas para evitar recalcular en cada render
    const hideableColumns = useMemo(() =>
        table.getAllColumns().filter(column => column.getCanHide()),
        [table]
    );

    const handleOpenChange = useCallback((open) => {
        setIsOpen(open);
        // Forzar actualización cuando se abre el menú
        if (open) {
            setUpdateKey(prev => prev + 1);
        }
    }, []);

    const handleUpdate = useCallback(() => {
        setUpdateKey(prev => prev + 1);
    }, []);

    return (
        hideableColumns.length > 0 && (
            <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                        {t('tables.columnas')} <Icon name="ChevronDown" className="w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="bg-custom-gray-default dark:bg-custom-blackLight max-h-[400px] overflow-y-auto"
                    onCloseAutoFocus={(event) => event.preventDefault()}
                    onEscapeKeyDown={() => setIsOpen(false)}
                    onPointerDownOutside={() => setIsOpen(false)}
                >
                    <ShowAllColumnsItem 
                        key={`show-all-${updateKey}`}
                        hideableColumns={hideableColumns} 
                        onUpdate={handleUpdate}
                        updateKey={updateKey}
                    />
                    <DropdownMenuSeparator />
                    {hideableColumns.map((column) => (
                        <ColumnVisibilityItem
                            key={`${column.id}-${updateKey}`}
                            column={column}
                            updateKey={updateKey}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    );
}

export default ColumnsVisibilitySelector;

