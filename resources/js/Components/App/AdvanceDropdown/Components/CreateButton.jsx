import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useDataTable } from "@/Components/App/DataTable/Context/DataTableContext";
import { memo, useCallback } from "react";

/**
 * Botón para crear un nuevo registro. Se muestra al final del dropdown
 * y permite al usuario iniciar el flujo de creación.
 * 
 * @returns {JSX.Element} - Botón de creación de nuevo registro
 */
function CreateButton({ }) {
    // Obtener el contexto de la tabla de datos
    const { viewContext } = useDataTable() || {};

    // Si no hay contexto, no se puede manejar la creación
    const canCreate = viewContext?.handleCreateUpdateView !== undefined;

    // Memoizar el handler para evitar recrearlo en cada renderizado
    const handleClick = useCallback(() => {
        if (canCreate) {
            viewContext.handleCreateUpdateView(null);
        }
    }, [canCreate, viewContext]);

    return (
        <Button
            onClick={handleClick}
            variant="ghost"
            className="text-custom-blackSemi font-normal flex gap-2 w-full items-center justify-start text-start dark:hover:text-custom-gray-light dark:text-custom-gray-semiLight rounded-md hover:bg-custom-gray-semiLight px-1"
        >
            <Icon name="Plus" className="w-5" aria-hidden="true" />
            <span className="sm:inline text-sm">
                Añadir registro
            </span>
        </Button>
    )
}

// Memoizar para evitar renderizados innecesarios
export default memo(CreateButton);