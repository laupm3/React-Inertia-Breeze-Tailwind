import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Crear el contexto
const PermissionsContext = createContext();

// Provider del contexto
export const PermissionsProvider = ({ children }) => {
    const [permissionsCache, setPermissionsCache] = useState({});
    const [loading, setLoading] = useState({});

    const checkPermissions = async (entity) => {
        // Si ya está cargando, retornar el estado actual
        if (loading[entity]) {
            return permissionsCache[entity] || { canImport: false, canExport: false, loading: true };
        }

        // Si ya tenemos los permisos en caché, retornarlos
        if (permissionsCache[entity]) {
            return permissionsCache[entity];
        }

        try {
            // Marcar como cargando
            setLoading(prev => ({ ...prev, [entity]: true }));

            // Verificar permisos usando el endpoint unificado que maneja todo internamente
            const response = await axios.get(`/api/v1/user/has/access-migrate/${entity}`);

            if (response.data.success) {
                const permissions = {
                    canExport: response.data.permissions.canExport,
                    canImport: response.data.permissions.canImport,
                    loading: false
                };

                // Guardar en caché
                setPermissionsCache(prev => ({ ...prev, [entity]: permissions }));
                setLoading(prev => ({ ...prev, [entity]: false }));

                return permissions;
            } else {
                throw new Error(response.data.message || `Error obteniendo permisos para ${entity}`);
            }

        } catch (error) {
            console.error('Error verificando permisos:', error);
            const errorPermissions = { canImport: false, canExport: false, loading: false };
            setPermissionsCache(prev => ({ ...prev, [entity]: errorPermissions }));
            setLoading(prev => ({ ...prev, [entity]: false }));
            return errorPermissions;
        }
    };

    const getPermissions = (entity) => {
        return permissionsCache[entity] || { canImport: false, canExport: false, loading: true };
    };

    const clearCache = (entity = null) => {
        if (entity) {
            setPermissionsCache(prev => {
                const newCache = { ...prev };
                delete newCache[entity];
                return newCache;
            });
            setLoading(prev => {
                const newLoading = { ...prev };
                delete newLoading[entity];
                return newLoading;
            });
        } else {
            setPermissionsCache({});
            setLoading({});
        }
    };

    const value = {
        checkPermissions,
        getPermissions,
        clearCache,
        permissionsCache,
        loading
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

// Hook para usar el contexto
export const usePermissionsContext = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissionsContext debe ser usado dentro de un PermissionsProvider');
    }
    return context;
};

// Hook mejorado que usa el contexto
export const usePermissions = (entity) => {
    const { checkPermissions, getPermissions } = usePermissionsContext();
    const [permissions, setPermissions] = useState({ canImport: false, canExport: false, loading: true });

    useEffect(() => {
        if (entity) {
            // Intentar obtener permisos del caché primero
            const cachedPermissions = getPermissions(entity);
            
            if (!cachedPermissions.loading) {
                setPermissions(cachedPermissions);
            } else {
                // Si no están en caché o están cargando, solicitarlos
                checkPermissions(entity).then(result => {
                    setPermissions(result);
                });
            }
        }
    }, [entity, checkPermissions, getPermissions]);

    return permissions;
};
