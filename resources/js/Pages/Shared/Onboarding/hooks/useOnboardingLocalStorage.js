import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../types/onboarding.types.js';

/**
 * Hook para manejar el localStorage del onboarding
 * @param {string} key - Clave del localStorage
 * @param {*} defaultValue - Valor por defecto
 * @returns {Array} [value, setValue, removeValue]
 */
export const useOnboardingLocalStorage = (key, defaultValue = null) => {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Verificar si el item existe y no es "undefined" como string
            if (item === null || item === 'undefined' || item === 'null') {
                // Si hay datos corruptos, limpiar y retornar default
                window.localStorage.removeItem(key);
                return defaultValue;
            }
            const parsed = JSON.parse(item);
            return parsed;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            // Limpiar el valor corrupto del localStorage
            window.localStorage.removeItem(key);
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((newValue) => {
        try {
            // Primero actualizamos el estado de React
            setValue(newValue);
            
            // Luego actualizamos localStorage
            if (newValue === null || newValue === undefined) {
                window.localStorage.removeItem(key);
            } else {
                const serialized = JSON.stringify(newValue);
                window.localStorage.setItem(key, serialized);
                
                // Verificar que se guardó correctamente
                const verification = window.localStorage.getItem(key);
                if (verification !== serialized) {
                    console.error(`Failed to save to localStorage key "${key}"`);
                }
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    const removeValue = useCallback(() => {
        try {
            setValue(defaultValue);
            window.localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, defaultValue]);

    return [value, setStoredValue, removeValue];
};

/**
 * Hook para manejar el progreso del onboarding page
 * @returns {Object} Estado y funciones del progreso
 */
export const useOnboardingProgress = () => {
    // Limpiar localStorage corrupto al inicializar
    useEffect(() => {
        const cleanCorruptedStorage = () => {
            const keys = Object.values(STORAGE_KEYS);
            keys.forEach(key => {
                const item = window.localStorage.getItem(key);
                if (item === 'undefined' || item === 'null') {
                    console.warn(`🧹 Cleaning corrupted localStorage key: ${key}`);
                    window.localStorage.removeItem(key);
                }
            });
        };
        
        cleanCorruptedStorage();
    }, []);

    const [visitedSteps, setVisitedSteps, clearVisitedSteps] = useOnboardingLocalStorage(
        STORAGE_KEYS.VISITED_STEPS,
        {
            step1: false,
            step2: false,
            step3: false,
            step4: false,
            step5: false,
        }
    );

    const [onboardingSkipped, setOnboardingSkipped, clearOnboardingSkipped] = useOnboardingLocalStorage(
        STORAGE_KEYS.ONBOARDING_SKIPPED,
        false
    );

    const [onboardingCompleted, setOnboardingCompleted, clearOnboardingCompleted] = useOnboardingLocalStorage(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        false
    );

    // Marcar paso como visitado
    const markStepAsVisited = useCallback((stepId) => {
        console.log(`✅ Marking step as visited: ${stepId}`);
        
        const newSteps = {
            ...visitedSteps,
            [stepId]: true
        };
        
        setVisitedSteps(newSteps);
    }, [setVisitedSteps, visitedSteps]);

    // Calcular progreso
    const totalSteps = Object.keys(visitedSteps).length;
    const completedSteps = Object.values(visitedSteps).filter(Boolean).length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Verificar si está completo - SOLO todos los pasos visitados O onboardingSkipped
    // No incluir onboardingCompleted del modal aquí para evitar conflictos
    const isComplete = Object.values(visitedSteps).every(Boolean) || onboardingSkipped;

    // Debugging temporal - eliminar después (solo errores importantes)
    useEffect(() => {
        // Solo log si hay problemas críticos - comentado para evitar spam
        /* if (onboardingSkipped && progressPercentage === 0 && !Object.values(visitedSteps).some(Boolean)) {
            console.warn('🔍 useOnboardingProgress CRITICAL:', {
                visitedSteps,
                onboardingSkipped,
                localStorage_visitedSteps: localStorage.getItem('visitedSteps'),
                localStorage_onboardingSkipped: localStorage.getItem('onboardingSkipped')
            });
        } */
    }, [visitedSteps, onboardingSkipped, onboardingCompleted, progressPercentage, isComplete]);

    // Reset completo del progreso
    const resetProgress = useCallback(() => {
        clearVisitedSteps();
        clearOnboardingSkipped();
        clearOnboardingCompleted();
    }, [clearVisitedSteps, clearOnboardingSkipped, clearOnboardingCompleted]);

    return {
        visitedSteps,
        onboardingSkipped,
        onboardingCompleted,
        totalSteps,
        completedSteps,
        progressPercentage,
        isComplete,
        markStepAsVisited,
        setOnboardingSkipped,
        setOnboardingCompleted,
        resetProgress
    };
};

/**
 * Hook para manejar el estado del modal del onboarding
 * @returns {Object} Estado y funciones del modal
 */
export const useOnboardingModal = () => {
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [onboardingModalKey, setOnboardingModalKey] = useState(0);

    // Mostrar modal
    const showModal = useCallback(() => {
        setShowOnboardingModal(true);
        setOnboardingModalKey(prev => prev + 1);
    }, []);

    // Ocultar modal
    const hideModal = useCallback(() => {
        setShowOnboardingModal(false);
    }, []);

    // Toggle modal
    const toggleModal = useCallback(() => {
        setShowOnboardingModal(prev => !prev);
        if (!showOnboardingModal) {
            setOnboardingModalKey(prev => prev + 1);
        }
    }, [showOnboardingModal]);

    return {
        showOnboardingModal,
        onboardingModalKey,
        showModal,
        hideModal,
        toggleModal
    };
};
