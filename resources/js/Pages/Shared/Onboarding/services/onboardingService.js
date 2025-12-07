import { OnboardingStorageService } from './onboardingStorage.js';
import { ONBOARDING_PAGE_CONFIG } from '../constants/onboardingConfig.js';

/**
 * Servicio principal para manejar la lógica del onboarding
 */
export class OnboardingService {
    /**
     * Inicializar el onboarding
     * @returns {Object} Estado inicial del onboarding
     */
    static initialize() {
        return OnboardingStorageService.getOnboardingState();
    }

    /**
     * Navegar a un paso específico del onboarding
     * @param {string} stepId - ID del paso
     * @param {function} [router] - Router para navegación (Inertia)
     */
    static navigateToStep(stepId, router = null) {
        const step = ONBOARDING_PAGE_CONFIG.steps.find(s => s.id === stepId);
        
        if (!step) {
            console.warn(`Step "${stepId}" not found in configuration`);
            return;
        }

        // Marcar paso como visitado
        OnboardingStorageService.markStepAsVisited(stepId);

        // Navegar a la URL si se proporciona router
        if (router && step.url) {
            router.visit(step.url);
        }

        return step;
    }

    /**
     * Completar el onboarding
     * @param {function} [router] - Router para navegación
     */
    static completeOnboarding(router = null) {
        // Marcar todos los pasos como visitados
        const allStepsVisited = {};
        ONBOARDING_PAGE_CONFIG.steps.forEach(step => {
            allStepsVisited[step.id] = true;
        });
        
        OnboardingStorageService.setVisitedSteps(allStepsVisited);

        // Navegar al dashboard
        if (router) {
            router.visit('/dashboard');
        }
    }

    /**
     * Omitir el onboarding
     * @param {function} [router] - Router para navegación
     */
    static skipOnboarding(router = null) {
        OnboardingStorageService.setOnboardingSkipped(true);

        // Navegar al dashboard
        if (router) {
            router.visit('/dashboard');
        }
    }

    /**
     * Reiniciar el onboarding
     */
    static resetOnboarding() {
        OnboardingStorageService.clearAll();
    }

    /**
     * Verificar si se debe mostrar el onboarding
     * @returns {boolean} Si se debe mostrar
     */
    static shouldShowOnboarding() {
        return !OnboardingStorageService.isOnboardingCompleted();
    }

    /**
     * Obtener el siguiente paso disponible
     * @returns {Object|null} Siguiente paso o null si no hay más
     */
    static getNextStep() {
        const visitedSteps = OnboardingStorageService.getVisitedSteps();
        
        return ONBOARDING_PAGE_CONFIG.steps.find(step => !visitedSteps[step.id]) || null;
    }

    /**
     * Obtener el paso actual (último visitado)
     * @returns {Object|null} Paso actual o null
     */
    static getCurrentStep() {
        const visitedSteps = OnboardingStorageService.getVisitedSteps();
        const visitedStepIds = Object.keys(visitedSteps).filter(id => visitedSteps[id]);
        
        if (visitedStepIds.length === 0) {
            return ONBOARDING_PAGE_CONFIG.steps[0] || null;
        }

        const lastVisitedId = visitedStepIds[visitedStepIds.length - 1];
        return ONBOARDING_PAGE_CONFIG.steps.find(step => step.id === lastVisitedId) || null;
    }

    /**
     * Validar datos del empleado para el onboarding
     * @param {Object} empleado - Datos del empleado
     * @returns {Object} Resultado de la validación
     */
    static validateEmployeeData(empleado) {
        const errors = [];
        const warnings = [];

        if (!empleado) {
            errors.push('No se encontraron datos del empleado');
            return { isValid: false, errors, warnings };
        }

        if (!empleado.user?.id) {
            errors.push('ID de usuario no válido');
        }

        if (!empleado.departamentos?.length) {
            warnings.push('No se encontró información del departamento');
        } else {
            const departamento = empleado.departamentos[0];
            if (!departamento.manager) {
                warnings.push('No se encontró información del manager');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            hasManager: Boolean(empleado.departamentos?.[0]?.manager),
            hasDepartment: Boolean(empleado.departamentos?.length)
        };
    }

    /**
     * Generar reporte del progreso del onboarding
     * @returns {Object} Reporte detallado
     */
    static getProgressReport() {
        const state = OnboardingStorageService.getOnboardingState();
        const currentStep = this.getCurrentStep();
        const nextStep = this.getNextStep();

        return {
            ...state,
            currentStep,
            nextStep,
            stepsRemaining: ONBOARDING_PAGE_CONFIG.steps.length - state.completedSteps,
            estimatedTimeRemaining: (ONBOARDING_PAGE_CONFIG.steps.length - state.completedSteps) * 5, // 5 min por paso
            shouldShowOnboarding: this.shouldShowOnboarding()
        };
    }
}
