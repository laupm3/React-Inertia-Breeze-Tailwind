import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

/**
 * Sistema de cache inteligente basado en timestamps y eventos
 * Se invalida automáticamente cuando detecta cambios en los datos
 */
class IntelligentCache {
    constructor() {
        this.cache = new Map();
        this.listTimestamp = null;
        this.dataVersion = 0;
    }

    /**
     * Genera una clave única para cada solicitud
     */
    generateKey(solicitudId, type = 'detail') {
        return `${type}_${solicitudId}`;
    }

    /**
     * Obtiene datos del cache si son válidos
     */
    get(solicitudId, type = 'detail') {
        const key = this.generateKey(solicitudId, type);
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Verificar si el cache global ha cambiado
        if (this.listTimestamp && cached.timestamp < this.listTimestamp) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Guarda datos en cache con timestamp
     */
    set(solicitudId, data, type = 'detail') {
        const key = this.generateKey(solicitudId, type);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            version: this.dataVersion
        });
    }

    /**
     * Invalida cache específico o completo
     */
    invalidate(solicitudId = null, type = null) {
        if (solicitudId && type) {
            // Invalidar cache específico
            const key = this.generateKey(solicitudId, type);
            this.cache.delete(key);
        } else if (solicitudId) {
            // Invalidar todos los tipos para una solicitud
            ['detail', 'list'].forEach(t => {
                const key = this.generateKey(solicitudId, t);
                this.cache.delete(key);
            });
        } else {
            // Invalidar todo el cache
            this.cache.clear();
            this.listTimestamp = Date.now();
            this.dataVersion++;
        }
    }

    /**
     * Marca que la lista global ha cambiado
     */
    markListChanged() {
        this.listTimestamp = Date.now();
        this.dataVersion++;
        
        // Limpiar caches que puedan estar obsoletos
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < this.listTimestamp) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Obtiene información del estado del cache
     */
    getStats() {
        return {
            size: this.cache.size,
            listTimestamp: this.listTimestamp,
            dataVersion: this.dataVersion,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Instancia global del cache (singleton)
const globalSolicitudCache = new IntelligentCache();

/**
 * Hook para manejar la carga de detalles completos de una solicitud específica
 * Implementa cache inteligente basado en eventos y timestamps
 */
export function useSolicitudDetails() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);
    
    // Estado para debug del cache
    const [cacheStats, setCacheStats] = useState(() => globalSolicitudCache.getStats());

    /**
     * Actualiza las estadísticas del cache
     */
    const updateCacheStats = useCallback(() => {
        setCacheStats(globalSolicitudCache.getStats());
    }, []);

    /**
     * Obtiene datos desde cache si están disponibles y válidos
     */
    const getFromCache = useCallback((solicitudId) => {
        const cached = globalSolicitudCache.get(solicitudId, 'detail');
        updateCacheStats();
        return cached;
    }, [updateCacheStats]);

    /**
     * Guarda datos en cache
     */
    const saveToCache = useCallback((solicitudId, data) => {
        globalSolicitudCache.set(solicitudId, data, 'detail');
        updateCacheStats();
    }, [updateCacheStats]);

    /**
     * Invalida cache para una solicitud específica o todo el cache
     */
    const invalidateCache = useCallback((solicitudId = null) => {
        globalSolicitudCache.invalidate(solicitudId, 'detail');
        updateCacheStats();
    }, [updateCacheStats]);

    /**
     * Marca que los datos globales han cambiado (llamar desde DataHandlerContext)
     */
    const markGlobalDataChanged = useCallback(() => {
        globalSolicitudCache.markListChanged();
        updateCacheStats();
    }, [updateCacheStats]);

    /**
     * Carga los detalles completos de una solicitud
     */
    const fetchSolicitudDetails = useCallback(async (solicitudId, forceRefresh = false) => {
        if (!solicitudId) {
            setError('ID de solicitud no válido');
            return null;
        }

        const solicitudIdStr = String(solicitudId);

        // Verificar cache primero (si no es refresh forzado)
        if (!forceRefresh) {
            const cachedData = getFromCache(solicitudIdStr);
            if (cachedData) {
                setDetails(cachedData);
                setError(null);
                return cachedData;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(route('api.v1.admin.solicitudes.show', solicitudIdStr));
            
            if (response.status === 200 && response.data.solicitud) {
                const solicitudData = response.data.solicitud;
                
                // Guardar en cache
                saveToCache(solicitudIdStr, solicitudData);
                
                // Actualizar estado
                setDetails(solicitudData);
                
                return solicitudData;
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [getFromCache, saveToCache]);

    /**
     * Limpia el estado actual
     */
    const clearDetails = useCallback(() => {
        setDetails(null);
        setError(null);
        setIsLoading(false);
    }, []);

    /**
     * Obtiene detalles desde cache sin hacer petición HTTP
     */
    const getCachedDetails = useCallback((solicitudId) => {
        if (!solicitudId) return null;
        return getFromCache(String(solicitudId));
    }, [getFromCache]);

    // Efecto para mantener las stats actualizadas
    useEffect(() => {
        updateCacheStats();
    }, [updateCacheStats]);

    return {
        // Estados
        isLoading,
        error,
        details,
        
        // Funciones principales
        fetchSolicitudDetails,
        clearDetails,
        
        // Funciones de cache
        getCachedDetails,
        invalidateCache,
        markGlobalDataChanged,
        
        // Información del cache
        cacheStats
    };
}

// Exportar también el cache global para uso avanzado
export { globalSolicitudCache };
