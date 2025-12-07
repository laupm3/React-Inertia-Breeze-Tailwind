import { STORAGE_KEYS } from '../types/onboarding.types.js';

/**
 * Servicio para manejar el localStorage del onboarding
 */
export class OnboardingStorageService {
    /**
     * Obtener valor del localStorage
     * @param {string} key - Clave del storage
     * @param {*} defaultValue - Valor por defecto
     * @returns {*} Valor almacenado o valor por defecto
     */
    static get(key, defaultValue = null) {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Establecer valor en localStorage
     * @param {string} key - Clave del storage
     * @param {*} value - Valor a almacenar
     */
    static set(key, value) {
        try {
            if (value === null || value === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }

    /**
     * Remover valor del localStorage
     * @param {string} key - Clave del storage
     */
    static remove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }

    /**
     * Limpiar todos los datos del onboarding
     */
    static clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            this.remove(key);
        });
    }

    /**
     * Obtener pasos visitados
     * @returns {Object} Objeto con los pasos visitados
     */
    static getVisitedSteps() {
        return this.get(STORAGE_KEYS.VISITED_STEPS, {
            step1: false,
            step2: false,
            step3: false,
            step4: false,
            step5: false,
        });
    }

    /**
     * Establecer pasos visitados
     * @param {Object} visitedSteps - Objeto con los pasos visitados
     */
    static setVisitedSteps(visitedSteps) {
        this.set(STORAGE_KEYS.VISITED_STEPS, visitedSteps);
    }

    /**
     * Marcar paso como visitado
     * @param {string} stepId - ID del paso
     */
    static markStepAsVisited(stepId) {
        const visitedSteps = this.getVisitedSteps();
        visitedSteps[stepId] = true;
        this.setVisitedSteps(visitedSteps);
    }

    /**
     * Verificar si el onboarding fue omitido
     * @returns {boolean} Si fue omitido
     */
    static isOnboardingSkipped() {
        return this.get(STORAGE_KEYS.ONBOARDING_SKIPPED, false);
    }

    /**
     * Marcar onboarding como omitido
     * @param {boolean} skipped - Si fue omitido
     */
    static setOnboardingSkipped(skipped = true) {
        this.set(STORAGE_KEYS.ONBOARDING_SKIPPED, skipped);
    }

    /**
     * Verificar si el onboarding está completado
     * @returns {boolean} Si está completado
     */
    static isOnboardingCompleted() {
        const visitedSteps = this.getVisitedSteps();
        const allStepsVisited = Object.values(visitedSteps).every(Boolean);
        const wasSkipped = this.isOnboardingSkipped();
        
        return allStepsVisited || wasSkipped;
    }

    /**
     * Calcular porcentaje de progreso
     * @returns {number} Porcentaje de progreso (0-100)
     */
    static getProgressPercentage() {
        const visitedSteps = this.getVisitedSteps();
        const totalSteps = Object.keys(visitedSteps).length;
        const completedSteps = Object.values(visitedSteps).filter(Boolean).length;
        
        return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    }

    /**
     * Obtener estado completo del onboarding
     * @returns {Object} Estado completo
     */
    static getOnboardingState() {
        const visitedSteps = this.getVisitedSteps();
        const onboardingSkipped = this.isOnboardingSkipped();
        
        return {
            visitedSteps,
            onboardingSkipped,
            isCompleted: this.isOnboardingCompleted(),
            progressPercentage: this.getProgressPercentage(),
            totalSteps: Object.keys(visitedSteps).length,
            completedSteps: Object.values(visitedSteps).filter(Boolean).length
        };
    }
}
