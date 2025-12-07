import { useContext, createContext, useState } from "react";

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
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
export const ViewContextProvider = ({
    children,
    CreateUpdateViewComponent = null,
    SheetTableViewComponent = null,
    DeleteViewComponent = null
}) => {
    const [createUpdateView, setCreateUpdateView] = useState(
        { open: false, model: null }
    );
    const [sheetView, setSheetView] = useState(
        { open: false, model: null }
    );
    const [destroyView, setDestroyView] = useState(
        { open: false, model: null }
    );

    /**
     * Extrae el ID del modelo de un objeto o primitivo o devuelve null si no es válido
     * 
     * @param {Any} model 
     * @returns 
     */
    const extractModel = (model) => model?.id ?? model ?? null;

    const handleCreateUpdateView = (model) => {
        setCreateUpdateView((prev) => {
            return {
                open: !prev.open,
                model: extractModel(model),
            }
        });
    };

    const handleSheetView = (model) => {
        setSheetView((prev) => {
            return {
                open: !prev.open,
                model: extractModel(model),
            }
        });
    };

    const handleDestroyView = (model) => {
        setDestroyView((prev) => {
            return {
                open: !prev.open,
                model: extractModel(model),
            }
        });
    }

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
