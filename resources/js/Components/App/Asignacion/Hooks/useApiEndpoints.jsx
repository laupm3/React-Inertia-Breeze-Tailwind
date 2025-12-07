import { useMemo } from "react";

/**
 * Hook personalizado que proporciona los endpoints de API para operaciones CRUD de asignaciones.
 * 
 * Utiliza el helper `route()` de Laravel para generar URLs seguras y
 * memoiza los resultados para evitar recálculos innecesarios.
 *
 * @function useApiEndpoints
 * @param {Object|null} model - El modelo de asignación para operaciones de edición/visualización
 * @returns {Object} Objeto con los endpoints para mostrar, crear y actualizar asignaciones
 * @property {string|null} show - URL para obtener una asignación específico (null si no hay modelo)
 * @property {string} store - URL para crear una nueva asignación
 * @property {string|null} update - URL para actualizar una asignación existente (null si no hay modelo)
 * @property {string|null} delete - URL para eliminar una asignación existente (null si no hay modelo)
 * 
 * @example
 * // Para una asignación existente
 * const endpoints = useApiEndpoints(asignacionProp);
 * // Resultado: { show: '/api/v1/admin/asignaciones/1', store: '/api/v1/admin/asignaciones', update: '/api/v1/admin/asignaciones/1' }
 * 
 * @example
 * // Para crear una nueva asignación (sin modelo)
 * const endpoints = useApiEndpoints(null);
 * // Resultado: { show: null, store: '/api/v1/admin/asignaciones', update: null }
 */
const useApiEndpoints = (model) => {
    return useMemo(() => ({
        show: model ? route("api.v1.admin.asignaciones.show", { asignacion: model }) : null,
        store: route("api.v1.admin.asignaciones.store"),
        update: model ? route("api.v1.admin.asignaciones.update", { asignacion: model }) : null,
        delete: model ? route("api.v1.admin.asignaciones.destroy", { asignacion: model }) : null,
    }), [model]);
}

export default useApiEndpoints;