import { useCallback, useContext, useEffect, createContext, useState } from "react";
import axios from "axios";

/**
 * Contexto para manejar el estado global
 * @type {React.Context}
 */
const DataHandlerContext = createContext(null);

// Cache global para contratos individuales
const contratoDetailCache = new Map();
const contratoDetailPendingRequests = new Map();

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

  /**
   * Obtiene los datos detallados de un contrato específico usando caché
   * @param {number|string} contratoId - ID del contrato
   * @returns {Promise<Object>} Datos del contrato
   */
  const getContratoDetail = useCallback(async (contratoId) => {
    // Verificar si ya tenemos los datos en cache
    if (contratoDetailCache.has(contratoId)) {
      return contratoDetailCache.get(contratoId);
    }

    // Verificar si ya hay una llamada en progreso para este contrato
    if (contratoDetailPendingRequests.has(contratoId)) {
      return contratoDetailPendingRequests.get(contratoId);
    }

    // Crear la promesa para la llamada
    const fetchPromise = axios.get(route('api.v1.admin.contratos.show', { contrato: contratoId }))
      .then(response => {
        if (response.status === 200) {
          const contratoData = response.data.contrato;
          // Guardar en cache
          contratoDetailCache.set(contratoId, contratoData);
          
          // Limpiar cache después de 5 minutos para evitar que se llene demasiado
          setTimeout(() => {
            if (contratoDetailCache.has(contratoId)) {
              contratoDetailCache.delete(contratoId);
            }
          }, 5 * 60 * 1000); // 5 minutos
          
          return contratoData;
        }
        throw new Error('Error al obtener datos del contrato');
      })
      .finally(() => {
        // Limpiar la promesa pendiente
        contratoDetailPendingRequests.delete(contratoId);
      });

    // Guardar la promesa pendiente
    contratoDetailPendingRequests.set(contratoId, fetchPromise);
    
    return fetchPromise;
  }, []);

  /**
   * Limpia el caché de un contrato específico (útil después de actualizaciones)
   * @param {number|string} contratoId - ID del contrato
   */
  const clearContratoCache = useCallback((contratoId) => {
    if (contratoDetailCache.has(contratoId)) {
      contratoDetailCache.delete(contratoId);
    }
  }, []);

  /**
   * Elimina un item de la data global filtrando por su id y elimina cualquier undefined
   */
  const deleteItem = useCallback((id) => {
    setData((prevData) => prevData.filter((item) => item && typeof item.id !== 'undefined' && item.id !== id));
    // Limpiar caché del contrato eliminado
    clearContratoCache(id);
  }, [clearContratoCache]);

  // Refuerza setData para filtrar siempre elementos válidos
  const safeSetData = (data) => {
    setData(Array.isArray(data) ? data.filter(item => item && typeof item.id !== 'undefined') : []);
  };

  // Cambia fetchData para usar safeSetData
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(route('api.v1.admin.contratos.index'));
      if (response.status === 200) {
        safeSetData(response.data.contratos);
      } else {
        safeSetData([]);
      }
    } catch (error) {
      console.log('error :>> ', error);
      safeSetData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza la data en el estado global buscando el item actualizado por su id, 
   * de lo contrario agrega el nuevo item al principio
   */
  const updateData = useCallback((newItem) => {
    setData((prevData) => {
      // Filtra elementos válidos
      const filtered = prevData.filter((item) => item && typeof item.id !== 'undefined');
      // Filtra el elemento existente (si existe) y coloca el nuevo al principio
      const exists = filtered.some((item) => item.id === newItem?.id);
      return exists
        ? [
            newItem,
            ...filtered.filter((item) => item.id !== newItem.id)
          ]
        : [newItem, ...filtered];
    });
    
    // Limpiar caché del contrato actualizado
    if (newItem?.id) {
      clearContratoCache(newItem.id);
    }
  }, [clearContratoCache]);

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
      deleteItem,
      getContratoDetail,
      clearContratoCache
    }}>
      {children}
    </DataHandlerContext.Provider>
  );
};

export { DataHandlerContextProvider, useDataHandler };