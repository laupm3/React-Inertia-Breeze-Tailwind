import axios from "axios";
import { useContext, useEffect, createContext, useState } from "react";
import useApiEndpoints from "../../Hooks/useApiEndpoints";

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
const DataHandlerContextProvider = ({ children, model, onOpenChange }) => {

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const endpoints = useApiEndpoints(model);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const response = await axios.get(endpoints.contratosVigentes);

        if (response.status === 200) {
          setData(response.data.empleado);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [model]);

  return (
    <DataHandlerContext.Provider value={{
      data,
      setData,
      isLoading,
      setIsLoading,
      error,
      setError,
      onOpenChange
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };