import { useCallback, useContext, useEffect, createContext, useState } from "react";

/**
 * Contexto para manejar el estado global
 * @type {React.Context}
 */
const DataHandlerContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto
 * @throws {Error} Si se usa fuera del DataHandlerContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
function useDataHandler() {
    const context = useContext(DataHandlerContext);
    if (!context) {
        throw new Error('useDataHandler debe usarse dentro de DataHandlerContextProvider');
    }
    return context;
}

/**
 * Proveedor del contexto:
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element} Proveedor del contexto con sus valores
 */
const DataHandlerContextProvider = ({ children }) => {

    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        // Establecer loading a true al iniciar la petición
        setLoading(true);

        try {
            const response = await axios.get(route('api.v1.admin.modules.index'));

            if (response.status === 200) {
                setData(response.data.modules);
            } else {
                setData([]);
            }
        } catch (error) {
            console.log('error :>> ', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [setData, setLoading]);

    /**
     * Actualiza la data en el estado global buscando el item actualizado por su id, 
     * de lo contrario agrega el nuevo item al principio
     */
    const updateData = useCallback((newItem) => {
        setData((prevData) => {
            let updatedData = prevData.map((module) => {
                // Si contiene el permiso, lo eliminamos de este módulo
                const contienePermiso = module.permissions.some(
                    (permission) => permission.id === newItem.id
                );

                if (contienePermiso) {
                    return {
                        ...module,
                        permissions: module.permissions.filter(
                            (permission) => permission.id !== newItem.id
                        )
                    };
                }

                return module;
            });

            // Ahora insertamos o actualizamos el permiso en el módulo correcto
            updatedData = updatedData.map((module) => {
                if (module.id !== newItem.module.id) return module;

                const permisoExiste = module.permissions.some(
                    (permission) => permission.id === newItem.id
                );

                const updatedPermissions = permisoExiste
                    ? module.permissions.map((permission) =>
                        permission.id === newItem.id ? newItem : permission
                    )
                    : [...module.permissions, newItem];

                return {
                    ...module,
                    permissions: updatedPermissions
                };
            });

            return updatedData;
        });
    }, []);

    /**
     * Elimina un item de la data global filtrando por su id
     */
    const deleteItem = useCallback((id) => {
        setData((prevData) =>
            prevData.map((module) => {
                return {
                    ...module,
                    permissions: module.permissions.filter((permission) => permission.id !== id)
                };
            }).filter((module) => module.permissions.length > 0)
        );
    }, []);

    // Efecto para cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <DataHandlerContext.Provider value={{
            data,
            setData,
            fetchData,
            loading,
            updateData,
            deleteItem
        }}>
            {children}
        </DataHandlerContext.Provider>
    );
};

export { DataHandlerContextProvider, useDataHandler };