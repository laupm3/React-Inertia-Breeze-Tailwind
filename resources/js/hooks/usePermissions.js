import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook para verificar permisos de usuario para importación y exportación
 * Versión optimizada que hace una sola solicitud HTTP por entidad
 * Combina la obtención del mapeo de permisos con la verificación de permisos del usuario
 * 
 * @param {string} entity - Entidad para la cual verificar permisos
 * @returns {Object} Estado de los permisos y funciones de verificación
 */
export const usePermissions = (entity) => {
    const [permissions, setPermissions] = useState({
        canExport: false,
        canImport: false,
        loading: true
    });

    useEffect(() => {
        const checkPermissions = async () => {
            if (!entity) {
                setPermissions({
                    canExport: false,
                    canImport: false,
                    loading: false
                });
                return;
            }

            try {
                setPermissions(prev => ({ ...prev, loading: true }));
                
                // Una sola solicitud que obtiene el mapeo de permisos y verifica los permisos del usuario
                const response = await axios.get(`/api/v1/user/has/access-migrate/${entity}`);
                
                if (response.data.success) {
                    setPermissions({
                        canExport: response.data.permissions.canExport,
                        canImport: response.data.permissions.canImport,
                        loading: false
                    });
                } else {
                    console.warn(`Error obteniendo permisos para ${entity}:`, response.data.message);
                    setPermissions({
                        canExport: false,
                        canImport: false,
                        loading: false
                    });
                }
                
            } catch (error) {
                console.error('Error verificando permisos:', error);
                
                // Fallback con permisos deshabilitados
                setPermissions({
                    canExport: false,
                    canImport: false,
                    loading: false
                });
            }
        };

        checkPermissions();
    }, [entity]);

    return permissions;
};
