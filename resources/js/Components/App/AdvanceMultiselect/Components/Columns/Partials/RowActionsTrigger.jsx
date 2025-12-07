
import { useDataTable } from "@/Components/App/DataTable/Context/DataTableContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { memo } from "react";

/**
 * Componente que muestra un menú desplegable con acciones para una fila de datos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.model - El modelo de datos de la fila actual
 * @returns {JSX.Element|null} - Menú de acciones o null si no hay acciones habilitadas
 */
function RowActionsTrigger({ model }) {
    // Obtener el contexto y las funciones necesarias
    const { viewContext } = useDataTable();

    const {
        handleCreateUpdateView,
        handleSheetView,
        enableCreateUpdateView,
        enableSheetTableView,
    } = viewContext;

    // Si ninguna acción está habilitada, no renderizar nada
    if (!enableCreateUpdateView && !enableSheetTableView) {
        return null;
    }

    /**
     * Detiene la propagación del evento de clic para evitar seleccionar la fila
     */
    const stopClickPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="btn hover:bg-custom-gray-semiLight dark:hover:bg-custom-blackSemi/50 rounded-full h-6 w-6 flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-offset-0"
                    onClick={stopClickPropagation}
                    aria-label="Acciones"
                >
                    <Icon name="Ellipsis" className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="dark:bg-custom-blackSemi"
                onClick={stopClickPropagation}
                align="end"
                sideOffset={5}
            >
                {/* Opción para ver información detallada */}
                {enableCreateUpdateView && (
                    <DropdownMenuItem
                        onSelect={() => handleSheetView(model)}
                        className="cursor-pointer"
                    >
                        <Icon name="Info" className="w-4 mr-2" />
                        <span>Información</span>
                    </DropdownMenuItem>
                )}

                {/* Opción para editar el elemento */}
                {enableSheetTableView && (
                    <DropdownMenuItem
                        onSelect={() => handleCreateUpdateView(model)}
                    >
                        <Icon name="SquarePen" className="w-4 mr-2" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu >
    )
}

// Memoizar el componente para evitar renderizaciones innecesarias
export default memo(RowActionsTrigger);