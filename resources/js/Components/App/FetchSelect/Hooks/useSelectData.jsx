import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// 🔄 Esto mantiene el cache global entre múltiples llamadas
const fetchCache = {};

/**
 * Hook optimizado para obtener y compartir datos cacheados
 * 
 * @param {string} fetchRoute - Ruta del endpoint (por ejemplo, 'api.v1.admin.empleados.type-documents')
 * @param {string} responseParameter - Nombre de la propiedad en la respuesta (por ejemplo, 'tipoDocumentos')
 * @returns {Object} { tiposDocumento, loading, error, reload }
 */
export default function useSelectData(fetchRoute, responseParameter) {
    const cacheKey = `${fetchRoute}::${responseParameter}`;

    if (!fetchCache[cacheKey]) {
        fetchCache[cacheKey] = {
            data: null,
            loading: false,
            error: null,
            subscribers: new Set(),
            async fetchData(force = false) {
                const cache = fetchCache[cacheKey];
                if (cache.data && !force) return;
                if (cache.loading && !force) return;

                cache.loading = true;
                cache.error = null;
                notify();

                try {
                    const response = await axios.get(route(fetchRoute));
                    cache.data = response.data?.[responseParameter] || [];
                } catch (err) {
                    console.error("Error al cargar datos:", err);
                    cache.error = "No se pudieron cargar los datos";
                } finally {
                    cache.loading = false;
                    notify();
                }
            }
        };
    }

    const { data, loading, error, subscribers, fetchData } = fetchCache[cacheKey];

    const [state, setState] = useState({ data, loading, error });

    const notify = () => {
        subscribers.forEach(fn => fn({ data: fetchCache[cacheKey].data, loading: fetchCache[cacheKey].loading, error: fetchCache[cacheKey].error }));
    };

    const reload = useCallback(() => {
        fetchData(true);
    }, [fetchRoute, responseParameter]);

    useEffect(() => {
        const subscriber = (newState) => setState(newState);
        subscribers.add(subscriber);

        if (!data && !loading) {
            fetchData();
        }

        return () => {
            subscribers.delete(subscriber);
        };
    }, [fetchRoute, responseParameter]);

    return {
        selectorData: state.data || [],
        loading: state.loading,
        error: state.error,
        reload
    };
}
