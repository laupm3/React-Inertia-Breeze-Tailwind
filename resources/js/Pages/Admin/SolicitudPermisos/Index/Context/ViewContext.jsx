import { useContext, createContext, useState } from "react";
import { toast } from "sonner";
import { useApproval } from '../Hooks/useApproval';

/**
 * Contexto para manejar el estado global del datatable
 * @type {React.Context}
 */
const ViewContext = createContext(null);

/**
 * Proveedor de contexto para los diferentes componentes de la sección de la aplicación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @param {React.Component|null} props.CreateUpdateViewComponent - Componente para crear/actualizar
 * @param {React.Component|null} props.SheetTableViewComponent - Componente para vista de hoja
 * @param {React.Component|null} props.DeleteViewComponent - Componente para eliminar
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
export const ViewContextProvider = ({
    children,
    CreateUpdateViewComponent = null,
    SheetTableViewComponent = null,
    DeleteViewComponent = null,
    refreshData = null // Nueva prop para refrescar datos
}) => {
    // Hook para manejar aprobaciones
    const { processApproval, isProcessing: isProcessingApproval } = useApproval();
    const [createUpdateView, setCreateUpdateView] = useState(
        { open: false, model: null }
    );
    const [sheetView, setSheetView] = useState(
        { open: false, model: null }
    );
    const [destroyView, setDestroyView] = useState(
        { open: false, model: null }
    );

    const handleCreateUpdateView = (model) => {
        setCreateUpdateView((prev) => {
            const newState = {
                open: !prev.open,
                model: extractModel(model)
            };
            return newState;
        });
    };

    const handleSheetView = (model) => {
        setSheetView((prev) => {
            return {
                open: !prev.open,
                model: extractModel(model)
            }
        });
    };

    const handleDestroyView = (model) => {
        setDestroyView((prev) => {
            return {
                open: !prev.open,
                model: extractModel(model)
            }
        });
    }

    /**
     * Maneja las acciones específicas del dropdown (aprobar, rechazar, etc.)
     * @param {Object} model - El modelo de la solicitud
     * @param {string} tipo - Tipo de acción (Direccion, RRHH, Administrador)
     * @param {string} accion - Acción a realizar (aprobar, denegar)
     * @param {string} observaciones - Observaciones o comentarios (opcional para aprobación, obligatorio para denegación)
     */
    const handleDropdownMenu = async (model, tipo, accion, observaciones = null) => {
        const solicitudId = model.id || model;
        
        const success = await processApproval(
            solicitudId, 
            tipo, 
            accion, 
            observaciones, // observaciones
            (data) => {
                // Callback de éxito - refrescar los datos si la función está disponible
                if (refreshData) {
                    refreshData();
                }
            }
        );
        
        return { success };
    }

    /**
     * Extrae el ID del modelo de un objeto o primitivo o devuelve null si no es válido
     * 
     * @param {Any} model 
     * @returns 
     */
    const extractModel = (model) => {
        const result = model?.id ?? model ?? null;
        return result;
    };

    return (
        <ViewContext.Provider value={{
            createUpdateView,
            setCreateUpdateView,
            sheetView,
            setSheetView,
            destroyView,
            setDestroyView,
            handleCreateUpdateView,
            handleSheetView,
            handleDestroyView,
            handleDropdownMenu,
            isProcessingApproval, // Estado del procesamiento de aprobaciones
            CreateUpdateViewComponent,
            SheetTableViewComponent,
            DeleteViewComponent
        }}>
            {children}
        </ViewContext.Provider>
    );
};

/**
 * Hook personalizado para acceder al contexto de las vistas
 * 
 * @throws {Error} Si se usa fuera del ViewContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
export function useView() {
    const context = useContext(ViewContext);
    if (!context) {
        throw new Error('useView debe usarse dentro de ViewContextProvider');
    }
    return context;
} 