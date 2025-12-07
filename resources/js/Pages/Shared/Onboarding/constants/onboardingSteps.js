import { OnboardingStepId } from '../types/onboarding.types.js';

// ===== PASOS DEL ONBOARDING =====
export const ONBOARDING_STEPS_CONFIG = [
    {
        id: OnboardingStepId.WELCOME,
        title: "¡Bienvenido/a a Empresa!",
        description: "¡Estamos encantados de tenerte a bordo!",
        icon: "HeartHandshake"
    },
    {
        id: OnboardingStepId.ABOUT,
        title: "¿Quiénes somos?",
        description: "Formación que cambia vidas.",
        icon: "Earth"
    },
    {
        id: OnboardingStepId.TEAM,
        title: "Conoce a tu equipo",
        description: "¡Listo para comenzar!",
        icon: "Users"
    }
];

// ===== CONFIGURACIÓN DE NAVEGACIÓN =====
export const ONBOARDING_NAVIGATION = {
    allowStepSkipping: false,
    requireSequentialCompletion: true,
    allowRevisiting: true,
    autoProgressDelay: 500
};

// ===== CONFIGURACIÓN DE ANIMACIONES =====
export const ANIMATION_CONFIG = {
    stepTransition: {
        duration: 300,
        easing: 'ease-in-out'
    },
    contentFade: {
        duration: 500,
        delay: 100
    },
    progressBar: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

// ===== ESTILOS CONDICIONALES =====
export const getStepClasses = (isCompleted, isCurrent, canInteract) => {
    const baseClasses = "flex flex-row items-center gap-2 sm:gap-3 rounded-xl p-2 sm:p-3 lg:p-4 transition-all duration-300";
    
    if (isCompleted) {
        return `${baseClasses} bg-green-100 dark:bg-green-900/20`;
    }
    
    if (isCurrent) {
        return `${baseClasses} bg-custom-gray-default dark:bg-custom-blackSemi cursor-pointer`;
    }
    
    return `${baseClasses} bg-custom-gray-default dark:bg-custom-blackSemi opacity-50`;
};

export const getIconClasses = (isCompleted) => {
    const baseClasses = "flex-shrink-0 rounded-full p-1 sm:p-2";
    
    if (isCompleted) {
        return `${baseClasses} bg-green-600/30 text-green-600`;
    }
    
    return `${baseClasses} bg-custom-orange/20 text-custom-orange`;
};

// ===== HELPERS DE VALIDACIÓN =====
export const validateStepIndex = (index, totalSteps) => {
    return index >= 0 && index < totalSteps;
};

export const canInteractWithStep = (index, currentStep, completed, totalSteps) => {
    return index === currentStep || 
           (index === totalSteps - 1 && completed.slice(0, -1).every(Boolean));
};

// ===== HELPERS DE PROGRESO =====
export const calculateProgress = (completed) => {
    const totalSteps = completed.length;
    const completedSteps = completed.filter(Boolean).length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
};

export const isOnboardingComplete = (completed) => {
    return completed.every(Boolean);
};
