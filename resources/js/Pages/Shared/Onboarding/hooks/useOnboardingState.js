import { useState, useCallback, useMemo } from 'react';
import { ANIMATION_CONFIG, canInteractWithStep, isOnboardingComplete } from '../constants/index.js';

/**
 * Hook para manejar el estado del onboarding modal
 * @param {number} totalSteps - Número total de pasos
 * @returns {Object} Estado y funciones del onboarding
 */
export const useOnboardingState = (totalSteps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(Array(totalSteps).fill(false));
    const [showContent, setShowContent] = useState(false);
    const [activeContent, setActiveContent] = useState(0);
    const [animate, setAnimate] = useState(false);

    // Manejar click en paso
    const handleStepClick = useCallback((index) => {
        const canInteract = canInteractWithStep(index, currentStep, completed, totalSteps);
        
        if (!canInteract) return;

        // Si el paso ya está completado, solo cambiar el contenido activo
        if (completed[index]) {
            if (activeContent !== index) {
                setAnimate(false);
                setTimeout(() => {
                    setActiveContent(index);
                    setShowContent(true);
                    setTimeout(() => setAnimate(true), ANIMATION_CONFIG.contentFade.delay);
                }, ANIMATION_CONFIG.stepTransition.duration);
            }
            return;
        }

        // Marcar paso como completado
        const newCompleted = [...completed];
        newCompleted[index] = true;
        setCompleted(newCompleted);
        setAnimate(false);
        
        // Mostrar contenido con animación
        setTimeout(() => {
            setActiveContent(index);
            setShowContent(true);
            setTimeout(() => setAnimate(true), ANIMATION_CONFIG.contentFade.delay);
        }, ANIMATION_CONFIG.stepTransition.duration);
        
        // Avanzar al siguiente paso si no es el último
        if (index < totalSteps - 1) {
            setCurrentStep(index + 1);
        }
    }, [currentStep, completed, activeContent, totalSteps]);

    // Funciones de navegación
    const goToNextStep = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            handleStepClick(currentStep + 1);
        }
    }, [currentStep, totalSteps, handleStepClick]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            setActiveContent(prevStep);
        }
    }, [currentStep]);

    // Reset del onboarding
    const resetOnboarding = useCallback(() => {
        setCurrentStep(0);
        setCompleted(Array(totalSteps).fill(false));
        setShowContent(false);
        setActiveContent(0);
        setAnimate(false);
    }, [totalSteps]);

    // Estados calculados
    const allStepsCompleted = useMemo(() => isOnboardingComplete(completed), [completed]);
    const canGoNext = useMemo(() => currentStep < totalSteps - 1, [currentStep, totalSteps]);
    const canGoPrevious = useMemo(() => currentStep > 0, [currentStep]);

    return {
        // Estado
        currentStep,
        completed,
        showContent,
        activeContent,
        animate,
        allStepsCompleted,
        
        // Navegación
        canGoNext,
        canGoPrevious,
        
        // Funciones
        handleStepClick,
        goToNextStep,
        goToPreviousStep,
        resetOnboarding,
        setAnimate,
        setShowContent
    };
};

/**
 * Hook para manejar el estado específico de interacción con pasos
 * @param {number} stepIndex - Índice del paso
 * @param {Object} onboardingState - Estado del onboarding
 * @returns {Object} Estado de interacción del paso
 */
export const useStepInteraction = (stepIndex, onboardingState) => {
    const { currentStep, completed } = onboardingState;
    
    return useMemo(() => {
        const isCompleted = completed[stepIndex];
        const isCurrent = stepIndex === currentStep;
        const canInteract = canInteractWithStep(stepIndex, currentStep, completed, completed.length);
        
        return {
            isCompleted,
            isCurrent,
            canInteract,
            isAccessible: canInteract || isCompleted
        };
    }, [stepIndex, currentStep, completed]);
};
