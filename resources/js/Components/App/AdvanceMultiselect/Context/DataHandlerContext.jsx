import { useContext, useEffect, createContext, useState, useMemo, useCallback } from "react";
import axios from "axios";

// Constantes y configuración
const CACHE_CONFIG = {
  DEFAULT_CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  CLEANUP_INTERVAL: 5 * 60 * 1000,       // 5 minutos
  MAX_UNUSED_AGE: 30 * 60 * 1000,        // 30 minutos
  FETCH_DEBOUNCE: 1000,                  // 1 segundo
};

// Caché y limpieza
const dataHandlerCache = {};
let cleanupIntervalId = null;

/**
 * Elimina entradas de caché obsoletas o sin uso
 */
function cleanupCache() {
  const now = new Date();
  let entriesRemoved = 0;

  Object.entries(dataHandlerCache).forEach(([key, entry]) => {
    if (
      entry.subscribers.size === 0 &&
      entry.lastAccessed &&
      (now - entry.lastAccessed > CACHE_CONFIG.MAX_UNUSED_AGE)
    ) {
      delete dataHandlerCache[key];
      entriesRemoved++;
    }
  });

  if (entriesRemoved > 0) {
    console.debug(`Cache cleanup: removed ${entriesRemoved} unused entries`);
  }

  // Auto-detener el intervalo si no hay entradas
  if (Object.keys(dataHandlerCache).length === 0 && cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * Inicia el mecanismo de limpieza si no está activo
 */
function startCleanupMechanism() {
  if (!cleanupIntervalId) {
    cleanupIntervalId = setInterval(cleanupCache, CACHE_CONFIG.CLEANUP_INTERVAL);
  }
}

// Contexto
const DataHandlerContext = createContext(null);

/**
 * Hook para acceder al contexto de DataHandler
 * @returns {Object} - API del contexto
 */
function useDataHandler() {
  const context = useContext(DataHandlerContext);
  if (!context) {
    throw new Error('useDataHandler debe usarse dentro de DataHandlerContextProvider');
  }
  return context;
}

/**
 * Crea una entrada en la caché para la clave proporcionada
 * @param {string} cacheKey - Clave única de la caché
 * @param {string} fetchUrl - URL para obtener datos
 * @param {string} dataKey - Clave para extraer datos
 * @param {Function} transformData - Función para transformar datos
 * @param {Function} getItemId - Función para obtener ID de un elemento
 * @param {number} cacheDuration - Duración de la caché
 * @returns {Object} - Entrada de caché creada
 */
function createCacheEntry(cacheKey, fetchUrl, dataKey, transformData, getItemId, cacheDuration) {
  return {
    // Estado
    data: [],
    loading: false,
    error: null,
    subscribers: new Set(),
    lastFetched: null,
    lastFetchAttempt: null,
    lastAccessed: new Date(),
    cacheDuration,

    // Métodos
    updateAccessTime() {
      this.lastAccessed = new Date();
    },

    isFresh() {
      this.updateAccessTime();
      return this.lastFetched &&
        (new Date() - this.lastFetched < this.cacheDuration);
    },

    notify() {
      const currentState = {
        data: this.data,
        loading: this.loading,
        error: this.error
      };
      this.subscribers.forEach(fn => fn(currentState));
    },

    async fetchData(force = false) {
      this.updateAccessTime();

      // Evitar cargas redundantes
      if (this.loading && !force) return;

      // Debounce de peticiones
      const now = new Date();
      if (!force && this.lastFetchAttempt &&
        (now - this.lastFetchAttempt < CACHE_CONFIG.FETCH_DEBOUNCE)) {
        return;
      }

      this.lastFetchAttempt = now;
      this.loading = true;
      this.error = null;
      this.notify();

      try {
        if (!fetchUrl) throw new Error("URL no definida");

        const response = await axios.get(fetchUrl);

        if (response.status === 200) {
          // Extracción de datos
          let rawData;

          if (dataKey) {
            rawData = response.data[dataKey];
            if (rawData === undefined) {
              rawData = [];
            }
          } else {
            rawData = response.data;
          }

          // Normalización a array
          if (!Array.isArray(rawData)) {
            rawData = rawData ? [rawData] : [];
          }

          // Transformación
          try {
            const transformedData = transformData(rawData);
            this.data = Array.isArray(transformedData)
              ? transformedData
              : transformedData ? [transformedData] : [];
          } catch (e) {
            this.data = rawData;
            this.error = "Error al transformar datos";
          }

          this.lastFetched = new Date();
        } else {
          this.data = [];
          this.error = `Error de respuesta: ${response.status}`;
        }
      } catch (error) {
        this.data = [];
        this.error = error.message || "Error desconocido";
      } finally {
        this.loading = false;
        this.notify();
      }
    },

    invalidateCache() {
      this.updateAccessTime();
      this.lastFetched = null;
      return this.fetchData(true);
    },

    updateData(newItem) {
      this.updateAccessTime();

      const transformedItem = transformData([newItem])[0];
      const newItemId = getItemId(transformedItem);
      const exists = this.data.some(item => getItemId(item) === newItemId);

      if (exists) {
        this.data = [
          transformedItem,
          ...this.data.filter(item => getItemId(item) !== newItemId)
        ];
      } else {
        this.data = [transformedItem, ...this.data];
      }

      this.lastFetched = new Date();
      this.notify();

      debugCache();
    },

    addItem(newItem) {
      this.updateAccessTime();

      const transformedItem = transformData([newItem])[0];
      this.data = [transformedItem, ...this.data];

      this.lastFetched = new Date();
      this.notify();
    },

    updateBulk(newItems) {
      if (!newItems?.length) return;

      this.updateAccessTime();

      const transformedItems = transformData(newItems);
      const existingMap = new Map(this.data.map(item => [getItemId(item), item]));

      transformedItems.forEach(item => existingMap.set(getItemId(item), item));
      this.data = Array.from(existingMap.values());

      this.lastFetched = new Date();
      this.notify();
    }
  };
}

/**
 * Componente proveedor del contexto DataHandler
 */
function DataHandlerContextProvider({
  children,
  fetchUrl,
  dataKey,
  transformData = data => data,
  getItemId = item => item?.id,
  cacheDuration = CACHE_CONFIG.DEFAULT_CACHE_DURATION
}) {
  // Iniciar mecanismo de limpieza (una sola vez)
  useMemo(startCleanupMechanism, []);

  // Crear clave de caché estable
  const cacheKey = useMemo(() => {
    const normalizedUrl = fetchUrl?.replace?.(/\/$/, '') || 'unknown';
    return `${normalizedUrl}::${dataKey || ''}::${cacheDuration}`;
  }, [fetchUrl, dataKey, cacheDuration]);

  // Inicializar o recuperar entrada de caché
  if (!dataHandlerCache[cacheKey]) {
    dataHandlerCache[cacheKey] = createCacheEntry(
      cacheKey, fetchUrl, dataKey, transformData, getItemId, cacheDuration
    );
  }

  // Referencia estable a la caché
  const cache = dataHandlerCache[cacheKey];

  // Actualizar tiempo de acceso
  cache.updateAccessTime();

  // Estado local sincronizado con la caché
  const [state, setState] = useState({
    data: cache.data || [],
    loading: cache.loading || false,
    error: cache.error || null
  });

  // Suscripción a cambios en la caché
  useEffect(() => {
    // Función de suscripción estable
    const subscriber = newState => setState(newState);

    // Añadir suscriptor
    cache.subscribers.add(subscriber);

    // Actualización inicial
    setState({
      data: cache.data,
      loading: cache.loading,
      error: cache.error
    });

    // Determinar si se necesita cargar datos
    const needsFetch = !cache.loading &&
      (cache.data.length === 0 ||
        !cache.lastFetched ||
        !cache.isFresh());

    // Cargar si es necesario
    if (needsFetch) {
      cache.fetchData();
    }

    // Limpieza al desmontar
    return () => {
      cache.subscribers.delete(subscriber);

      if (cache.subscribers.size === 0) {
        cache.updateAccessTime();
      }
    };
  }, [cacheKey]);

  // API estable para el contexto
  const contextValue = useMemo(() => ({
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchData: cache.fetchData.bind(cache),
    updateData: cache.updateData.bind(cache),
    addItem: cache.addItem.bind(cache),
    updateBulk: cache.updateBulk.bind(cache),
    invalidateCache: cache.invalidateCache.bind(cache),
    isFresh: cache.isFresh.bind(cache),
    getItemId
  }), [state, cache, getItemId]);

  return (
    <DataHandlerContext.Provider value={contextValue}>
      {children}
    </DataHandlerContext.Provider>
  );
}

/**
 * Limpia manualmente entradas de caché
 * @param {string} [specificKey] - Clave específica (opcional)
 * @returns {number} - Número de entradas eliminadas
 */
function purgeCache(specificKey = null) {
  if (specificKey !== null) {
    if (dataHandlerCache[specificKey]) {
      delete dataHandlerCache[specificKey];
      return 1;
    }
    return 0;
  }

  const count = Object.keys(dataHandlerCache).length;
  Object.keys(dataHandlerCache).forEach(key => {
    delete dataHandlerCache[key];
  });

  return count;
}

/**
 * Muestra información de depuración sobre la caché
 * @param {string} [specificKey] - Clave específica (opcional)
 */
function debugCache(specificKey = null) {
  if (specificKey) {
    const entry = dataHandlerCache[specificKey];
    if (entry) {
      console.log(`Cache entry for ${specificKey}:`, {
        data: entry.data.length,
        loading: entry.loading,
        error: entry.error,
        subscribers: entry.subscribers.size,
        lastFetched: entry.lastFetched,
        lastAccessed: entry.lastAccessed,
      });
    } else {
      console.log(`No cache entry found for ${specificKey}`);
    }
    return;
  }

  console.log(`Total cache entries: ${Object.keys(dataHandlerCache).length}`);
  Object.entries(dataHandlerCache).forEach(([key, entry]) => {
    console.log(`${key}:`, {
      data: entry.data.length,
      loading: entry.loading,
      error: entry.error,
      subscribers: entry.subscribers.size,
      lastFetched: entry.lastFetched,
      lastAccessed: entry.lastAccessed,
    });
  });
}

// Exportaciones
export {
  DataHandlerContextProvider,
  useDataHandler,
  purgeCache,
  cleanupCache,
  debugCache
};