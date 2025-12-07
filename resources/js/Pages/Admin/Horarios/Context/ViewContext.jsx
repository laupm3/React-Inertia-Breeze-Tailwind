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
export const ViewContextProvider = ({ children }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleOpenDialog = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    const handleOpenSheet = () => {
        setIsSheetOpen(!isSheetOpen);
    };

    return (
        <ViewContext.Provider value={{
            isDialogOpen,
            setIsDialogOpen,
            isSheetOpen,
            setIsSheetOpen,
            handleOpenDialog,
            handleOpenSheet
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