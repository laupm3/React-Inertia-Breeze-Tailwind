import { useMemo } from "react";

/**
 * Hook personalizado que proporciona los endpoints de API para operaciones CRUD de centros.
 * 
 * Utiliza el helper `route()` de Laravel para generar URLs seguras y
 * memoiza los resultados para evitar recálculos innecesarios.
 *
 * @function useApiEndpoints
 * @param {Object|null} model - El modelo de centro para operaciones de edición/visualización
 * @returns {Object} Objeto con los endpoints para mostrar, crear y actualizar centros
 * @property {string|null} show - URL para obtener un centro específico (null si no hay modelo)
 * @property {string} store - URL para crear un nuevo centro
 * @property {string|null} update - URL para actualizar un centro existente (null si no hay modelo)
 * 
 * @example
 * // Para un centro existente
 * const endpoints = useApiEndpoints(centroProp);
 * // Resultado: { show: '/api/v1/admin/centros/1', store: '/api/v1/admin/centros', update: '/api/v1/admin/centros/1' }
 * 
 * @example
 * // Para crear un nuevo centro
 * const endpoints = useApiEndpoints(null);
 * // Resultado: { show: null, store: '/api/v1/admin/centros', update: null }
 */
const useApiEndpoints = (model) => {
    return useMemo(() => ({
        dataKey: "horario",

        show: model ? route("api.v1.admin.horarios.show", { horario: model }) : null,
        store: route("api.v1.admin.horarios.bulk-store"),
        update: model ? route("api.v1.admin.horarios.bulk-update") : null,
        delete: model ? route("api.v1.admin.horarios.bulk-destroy") : null,
        contratos: route("api.v1.admin.empleados.available-contracts"),
    }), [model]);
}

export default useApiEndpoints;