import { useMemo } from "react";

/**
 * Hook personalizado que proporciona los endpoints de API para operaciones CRUD de navegación.
 * 
 * Utiliza el helper `route()` de Laravel para generar URLs seguras y
 * memoiza los resultados para evitar recálculos innecesarios.
 *
 * @function useApiEndpoints
 * @param {Object|null} model - El modelo de navegación para operaciones de edición/visualización
 * @returns {Object} Objeto con los endpoints para mostrar, crear y actualizar navegación
 * @property {string|null} show - URL para obtener un elemento de navegación específico (null si no hay modelo)
 * @property {string} store - URL para crear un nuevo elemento de navegación
 * @property {string|null} update - URL para actualizar un elemento de navegación existente (null si no hay modelo)
 * @property {string|null} delete - URL para eliminar un elemento de navegación existente (null si no hay modelo)
 * 
 * @example
 * // Para un elemento de navegación existente
 * const endpoints = useApiEndpoints(navigationProp);
 * // Resultado: { show: '/api/v1/admin/navigation/1', store: '/api/v1/admin/navigation', update: '/api/v1/admin/navigation/1' }
 * 
 * @example
 * // Para crear un nuevo elemento de navegación
 * const endpoints = useApiEndpoints(null);
 * // Resultado: { show: null, store: '/api/v1/admin/navigation', update: null }
 */
const useApiEndpoints = (model) => {
    return useMemo(() => ({
        show: model ? route("api.v1.admin.navigation.show", { link: model.id || model }) : null,
        store: route("api.v1.admin.navigation.store"),
        update: model ? route("api.v1.admin.navigation.update", { link: model.id || model }) : null,
        delete: model ? route("api.v1.admin.navigation.destroy", { link: model.id || model }) : null,
    }), [model]);
}

export default useApiEndpoints;