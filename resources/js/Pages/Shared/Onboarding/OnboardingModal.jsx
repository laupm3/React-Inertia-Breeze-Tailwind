import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Icon from '@/imports/LucideIcon';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/App/Buttons/Button';
import { router } from '@inertiajs/react';
import { 
    StepProgress, 
    WelcomeContent, 
    AboutContent, 
    TeamContent 
} from './components/index.js';
import { 
    useOnboardingData, 
    useOnboardingState 
} from './hooks/index.js';
import { 
    ONBOARDING_STEPS_CONFIG,
    OnboardingStepId 
} from './constants/index.js';

/**
 * Modal de Onboarding refactorizado
 * @param {Object} props - Props del componente
 * @param {Array} props.empleados - Lista de empleados
 * @param {boolean} props.show - Si mostrar el modal
 * @param {function} props.onClose - Callback para cerrar
 * @returns {JSX.Element}
 */
const OnboardingModal = ({ empleados, show, onClose }) => {
    // Hooks del onboarding
    const onboardingData = useOnboardingData(empleados);
    const onboardingState = useOnboardingState(ONBOARDING_STEPS_CONFIG.length);

    const { managerInfo, departamento } = onboardingData;
    const { 
        showContent, 
        activeContent, 
        animate, 
        allStepsCompleted,
        handleStepClick,
        completed,
        currentStep
    } = onboardingState;

    // Efecto para marcar que se visitó el onboarding
    useEffect(() => {
        if (show) {
            localStorage.setItem('onboardingVisited', 'true');
        }
    }, [show]);

    // Efecto para mostrar el primer contenido al abrir
    useEffect(() => {
        if (show && !showContent) {
            handleStepClick(0);
        }
    }, [show, showContent, handleStepClick]);

    // Función para finalizar onboarding (igual que el original)
    const handleFinishOnboarding = () => {
        localStorage.setItem('onboardingCompleted', 'true');
        if (typeof onClose === "function") {
            onClose();
            router.visit('/onboarding');
        }
    };

    // Función para manejar el cierre del modal
    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    // Renderizar contenido basado en el paso activo
    const renderContent = () => {
        if (!showContent) return null;

        const currentStepId = ONBOARDING_STEPS_CONFIG[activeContent]?.id;

        switch (currentStepId) {
            case OnboardingStepId.WELCOME:
                return <WelcomeContent animate={animate} />;
            
            case OnboardingStepId.ABOUT:
                return <AboutContent animate={animate} />;
            
            case OnboardingStepId.TEAM:
                return (
                    <TeamContent 
                        animate={animate}
                        managerInfo={managerInfo}
                        departamento={departamento}
                    />
                );
            
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-custom-blackSemi dark:text-white">
                            Contenido no encontrado
                        </p>
                    </div>
                );
        }
    };

    return (
        <Modal 
            show={show} 
            onClose={handleClose}
            maxWidth="full"
            closeable={false}
        >
            <div className="h-screen w-full relative flex">
                {/* Sidebar izquierdo - Desktop */}
                <div className="hidden lg:flex w-80 bg-white dark:bg-custom-blackSemi flex-col">
                    {/* Logo */}
                    <div className="flex items-center justify-center p-8">
                        <ApplicationLogo className="w-16 h-16" />
                    </div>
                    
                    {/* Espaciador superior */}
                    <div className="flex-1"></div>
                    
                    {/* Progreso de pasos */}
                    <div className='pb-32'>
                        <StepProgress 
                            onboardingState={onboardingState}
                            onStepClick={handleStepClick}
                        />
                    </div>
                    
                    {/* Espaciador inferior */}
                    <div className="flex-1"></div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 flex flex-col bg-white dark:bg-custom-blackSemi">
                    {/* Header móvil - fijo */}
                    <div className="lg:hidden bg-white dark:bg-custom-blackSemi p-4 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <ApplicationLogo className="w-8 h-8" />
                            <div>
                                <h2 className="text-lg font-bold text-custom-blackSemi dark:text-white">
                                    Bienvenido/a a Empresa
                                </h2>
                                <p className="text-sm text-custom-blackSemi/70 dark:text-white/70">
                                    Conoce tu nueva empresa en 3 pasos
                                </p>
                            </div>
                        </div>
                        
                        {/* Progreso móvil */}
                        <div className="mt-4">
                            <StepProgress 
                                onboardingState={onboardingState}
                                onStepClick={handleStepClick}
                            />
                        </div>
                    </div>

                    {/* Header desktop - fijo */}
                    <div className="hidden lg:block bg-white dark:bg-custom-blackSemi p-6 lg:p-12 pb-0 flex-shrink-0">
                        <h1 className="text-3xl font-bold text-custom-blackSemi dark:text-white mb-2">
                            Bienvenido/a a Empresa
                        </h1>
                        <p className="text-lg text-custom-blackSemi/70 dark:text-white/70">
                            Conoce tu nueva empresa en 3 pasos
                        </p>
                    </div>

                    {/* Área de contenido scrolleable */}
                    <div className="flex-1 overflow-y-auto dark:dark-scrollbar">
                        <div className="p-6 lg:px-12 lg:pt-8">
                            {/* Contenido del paso actual */}
                            <div className="min-h-full">
                                {renderContent()}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción - fijos */}
                    <div className="bg-white dark:bg-custom-blackSemi p-6 lg:px-12 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            {allStepsCompleted ? (
                                <>
                                    <div></div>
                                    <Button
                                        onClick={handleFinishOnboarding}
                                        className="bg-custom-orange hover:bg-custom-orange/90 text-white"
                                    >
                                        <Icon name="ArrowRight" className="w-4 h-4 mr-2" />
                                        Ir a la app
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div></div>
                                    <Button
                                        onClick={handleFinishOnboarding}
                                        variant="outline"
                                        className="text-custom-blackSemi dark:text-white"
                                    >
                                        Omitir Onboarding
                                        <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OnboardingModal;