// ===== ÍNDICE DE CONSTANTES =====

export { ONBOARDING_CONFIG, ONBOARDING_PAGE_CONFIG, ONBOARDING_MESSAGES } from './onboardingConfig.js';
export { ONBOARDING_IMAGES, ONBOARDING_IMAGE_ALTS, getImageWithFallback, getImageAlt } from './onboardingImages.js';
export { 
    ONBOARDING_STEPS_CONFIG,
    ONBOARDING_NAVIGATION,
    ANIMATION_CONFIG,
    getStepClasses,
    getIconClasses,
    validateStepIndex,
    canInteractWithStep,
    calculateProgress,
    isOnboardingComplete
} from './onboardingSteps.js';

// Exportar también tipos y enums desde types
export { OnboardingStepId, OnboardingPageSteps, STORAGE_KEYS } from '../types/onboarding.types.js';
