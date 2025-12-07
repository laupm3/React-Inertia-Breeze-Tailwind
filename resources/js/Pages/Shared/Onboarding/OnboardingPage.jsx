import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OnboardingModal from './OnboardingModal.jsx';
import {
    useOnboardingProgress,
    useOnboardingModal
} from './hooks/index.js';
import { OnboardingService } from './services/index.js';
import { MobileLayout, DesktopLayout } from './components/index.js';

/**
 * Página de Onboarding refactorizada en componentes modulares
 * @param {Object} props - Props del componente
 * @param {Object} props.managerInfo - Información del manager
 * @param {Object} props.departamento - Información del departamento
 * @param {Array} props.empleados - Lista de empleados
 * @returns {JSX.Element}
 */
const OnboardingPage = ({ managerInfo, departamento, empleados }) => {
    // ===== HOOKS DEL ONBOARDING =====
    const onboardingProgress = useOnboardingProgress();
    const onboardingModal = useOnboardingModal();

    const {
        visitedSteps,
        onboardingSkipped,
        progressPercentage,
        isComplete,
        markStepAsVisited,
        setOnboardingSkipped,
        resetProgress
    } = onboardingProgress;

    const {
        showOnboardingModal,
        onboardingModalKey,
        showModal,
        hideModal
    } = onboardingModal;

    // ===== ESTADOS ADICIONALES =====
    const [onboardingModalKeyState, setOnboardingModalKey] = useState(0);
    const [allowRewatch, setAllowRewatch] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);

    // ===== ESTADO CALCULADO =====
    const isOnboardingComplete = Object.values(visitedSteps).every(Boolean) || onboardingSkipped;

    // ===== EFECTOS =====
    
    // Efecto para redireccionar al dashboard si onboarding fue omitido
    useEffect(() => {
        if (onboardingSkipped) {
            router.visit('/dashboard');
        }
    }, [onboardingSkipped]);

    // Efecto para mostrar mensaje de felicitación cuando se completa
    useEffect(() => {
        if (isOnboardingComplete && progressPercentage === 100) {
            setShowCompletionMessage(true);
            const timer = setTimeout(() => {
                setShowCompletionMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOnboardingComplete, progressPercentage]);

    // Efecto para limpiar datos corruptos del localStorage
    useEffect(() => {
        const corruptedKeys = ['visitedSteps', 'onboardingSkipped', 'onboardingCompleted'];
        corruptedKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value === 'undefined' || value === 'null') {
                localStorage.removeItem(key);
            }
        });
    }, []);

    // Efecto para mostrar modal automáticamente
    useEffect(() => {
        const onboardingVisited = localStorage.getItem('onboardingVisited') === 'true';

        if (!isComplete && !showOnboardingModal && !onboardingVisited) {
            const timer = setTimeout(() => {
                showModal();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isComplete, showOnboardingModal, showModal]);

    // Efecto para cerrar modal automáticamente cuando se completa
    useEffect(() => {
        if (isComplete && showOnboardingModal && !allowRewatch) {
            const timer = setTimeout(() => {
                hideModal();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isComplete, showOnboardingModal, allowRewatch, hideModal]);

    // ===== MANEJADORES DE EVENTOS =====
    
    /**
     * Manejar click en paso del onboarding
     */
    const handleStepClick = (step, url) => {
        if (url) {
            markStepAsVisited(step);
            setTimeout(() => {
                router.visit(url);
            }, 100);
        }
    };

    /**
     * Manejar completar onboarding e ir al dashboard
     */
    const handleCompleteToDashboard = () => {
        // Verificar que todos los pasos estén visitados antes de navegar
        const allStepsVisited = Object.values(visitedSteps).every(Boolean);
        if (allStepsVisited || onboardingSkipped) {
            localStorage.setItem('onboardingCompleted', 'true');
            router.visit('/dashboard');
        }
    };

    /**
     * Manejar omitir onboarding
     */
    const handleSkipOnboarding = () => {
        setOnboardingSkipped(true);
        localStorage.setItem('onboardingCompleted', 'true');
    };

    /**
     * Manejar click en presentación
     */
    const handlePresentationClick = () => {
        setAllowRewatch(true);
        setOnboardingModalKey(prev => prev + 1);
        showModal();
    };

    /**
     * Manejar cierre del modal
     */
    const handleCloseModal = () => {
        setAllowRewatch(false);
        hideModal();
    };

    // ===== PROPS COMPARTIDAS PARA LAYOUTS =====
    const sharedLayoutProps = {
        // Estados
        showCompletionMessage,
        progressPercentage,
        isOnboardingComplete,
        visitedSteps,
        managerInfo,
        departamento,
        
        // Funciones
        handleSkipOnboarding,
        handleCompleteToDashboard,
        handlePresentationClick,
        handleStepClick
    };

    // ===== RENDER =====
    
    // No renderizar nada si onboarding fue omitido
    if (onboardingSkipped) {
        return (
            <>
                <Head title="Redirigiendo..." />
                <div className="min-h-screen bg-custom-gray-light dark:bg-custom-blackLight flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto mb-4"></div>
                        <p className="text-custom-gray-semiDark dark:text-custom-white">Redirigiendo al dashboard...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Onboarding" />

            <div className="min-h-screen bg-custom-white dark:bg-custom-blackLight text-custom-gray-semiDark dark:text-custom-white">
                <MobileLayout {...sharedLayoutProps} />
                <DesktopLayout {...sharedLayoutProps} />
            </div>

            <OnboardingModal
                key={onboardingModalKeyState}
                show={showOnboardingModal}
                onClose={handleCloseModal}
                empleados={empleados}
            />
        </>
    );
};

// Layout
OnboardingPage.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default OnboardingPage;
