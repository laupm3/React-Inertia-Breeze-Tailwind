import { useMemo } from 'react';

/**
 * Hook personalizado que proporciona los endpoints de API para operaciones CRUD de solicitudes de permisos.
 * 
 * Utiliza el helper `route()` de Laravel para generar URLs seguras y
 * memoiza los resultados para evitar recálculos innecesarios.
 *
 * @function useApiEndpoints
 * @param {Object|null} model - El modelo de solicitud para operaciones de edición/visualización
 * @returns {Object} Objeto con los endpoints para mostrar, crear, actualizar y eliminar solicitudes
 * @property {string|null} show - URL para obtener una solicitud específica (null si no hay modelo)
 * @property {string} store - URL para crear una nueva solicitud
 * @property {string|null} update - URL para actualizar una solicitud existente (null si no hay modelo)
 * @property {string|null} delete - URL para eliminar una solicitud existente (null si no hay modelo)
 * 
 * @example
 * // Para una solicitud existente
 * const endpoints = useApiEndpoints(solicitudProp);
 * // Resultado: { show: '/api/v1/admin/vacaciones/1', store: '/api/v1/admin/vacaciones', update: '/api/v1/admin/vacaciones/1', delete: '/api/v1/admin/vacaciones/1' }
 * 
 * @example
 * // Para crear una nueva solicitud
 * const endpoints = useApiEndpoints(null);
 * // Resultado: { show: null, store: '/api/v1/admin/vacaciones', update: null, delete: null }
 */
const useApiEndpoints = (model) => {
    return useMemo(() => {
        const baseRoute = 'api.v1.admin.vacaciones';
        
        return {
            show: model ? route(`${baseRoute}.show`, model.id || model) : null,
            store: route(`${baseRoute}.store`),
            update: model ? route(`${baseRoute}.update`, model.id || model) : null,
            delete: model ? route(`${baseRoute}.destroy`, model.id || model) : null,
        };
    }, [model]);
}

export default useApiEndpoints;
