import { useCallback, useRef } from 'react';

/**
 * Hook personalizado para crear una versión debounced de una función
 * @param {Function} callback - Función a ejecutar después del debounce
 * @param {number} delay - Retraso en ms antes de ejecutar la función
 * @returns {Function} - Versión debounced de la función original
 */
export default function useDebounce(callback, delay = 500) {
    const timerRef = useRef(null);

    const debouncedFn = useCallback((...args) => {
        // Cancelar el timer anterior si existe
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Configurar un nuevo timer
        timerRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedFn;
}