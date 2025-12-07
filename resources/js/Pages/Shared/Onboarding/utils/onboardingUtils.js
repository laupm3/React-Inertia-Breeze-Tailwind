/**
 * Utilities para el onboarding
 */

/**
 * Formatear porcentaje de progreso
 * @param {number} percentage - Porcentaje (0-100)
 * @returns {string} Porcentaje formateado
 */
export const formatProgress = (percentage) => {
    return `${Math.round(percentage)}%`;
};

/**
 * Generar mensaje de progreso
 * @param {number} current - Paso actual
 * @param {number} total - Total de pasos
 * @returns {string} Mensaje de progreso
 */
export const getProgressMessage = (current, total) => {
    if (current >= total) {
        return '¡Onboarding completado!';
    }
    return `Paso ${current + 1} de ${total}`;
};

/**
 * Validar si una URL es segura
 * @param {string} url - URL a validar
 * @returns {boolean} Si la URL es segura
 */
export const isSafeUrl = (url) => {
    if (!url) return false;
    
    try {
        const parsedUrl = new URL(url, window.location.origin);
        return parsedUrl.origin === window.location.origin;
    } catch {
        return url.startsWith('/') && !url.startsWith('//');
    }
};

/**
 * Debounce function para optimizar rendimiento
 * @param {function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {function} Función debounced
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function para optimizar rendimiento
 * @param {function} func - Función a throttle
 * @param {number} limit - Límite de tiempo en ms
 * @returns {function} Función throttled
 */
export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

/**
 * Generar ID único para elementos
 * @param {string} prefix - Prefijo para el ID
 * @returns {string} ID único
 */
export const generateId = (prefix = 'onboarding') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verificar si el dispositivo es móvil
 * @returns {boolean} Si es dispositivo móvil
 */
export const isMobile = () => {
    return window.innerWidth < 768;
};

/**
 * Verificar si el dispositivo es tablet
 * @returns {boolean} Si es tablet
 */
export const isTablet = () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Verificar si el dispositivo es desktop
 * @returns {boolean} Si es desktop
 */
export const isDesktop = () => {
    return window.innerWidth >= 1024;
};

/**
 * Obtener el tipo de dispositivo
 * @returns {string} Tipo de dispositivo ('mobile', 'tablet', 'desktop')
 */
export const getDeviceType = () => {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
};

/**
 * Scroll suave a un elemento
 * @param {string|Element} target - Selector o elemento objetivo
 * @param {Object} options - Opciones de scroll
 */
export const smoothScrollTo = (target, options = {}) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (!element) return;

    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
};

/**
 * Crear delay con Promise
 * @param {number} ms - Milisegundos de delay
 * @returns {Promise} Promise que se resuelve después del delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verificar si el usuario prefiere movimiento reducido
 * @returns {boolean} Si prefiere movimiento reducido
 */
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Obtener configuración de animación basada en preferencias
 * @returns {Object} Configuración de animación
 */
export const getAnimationConfig = () => {
    if (prefersReducedMotion()) {
        return {
            duration: 0,
            easing: 'linear'
        };
    }
    
    return {
        duration: 300,
        easing: 'ease-in-out'
    };
};
