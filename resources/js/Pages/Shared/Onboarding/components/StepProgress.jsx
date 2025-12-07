import StepItem from './StepItem.jsx';
import { ONBOARDING_STEPS_CONFIG, calculateProgress } from '../constants/index.js';
import { useStepInteraction } from '../hooks/index.js';

/**
 * Componente para mostrar el progreso de pasos del onboarding
 * @param {Object} props - Props del componente
 * @param {Object} props.onboardingState - Estado del onboarding
 * @param {function} props.onStepClick - Callback para click en paso
 * @returns {JSX.Element}
 */
const StepProgress = ({ onboardingState, onStepClick }) => {
    const { completed } = onboardingState;
    const progressPercentage = calculateProgress(completed);

    return (
        <div className="w-full space-y-4">
            {/* Lista de pasos */}
            <div className="space-y-2 sm:space-y-3">
                {ONBOARDING_STEPS_CONFIG.map((step, index) => {
                    const stepInteraction = useStepInteraction(index, onboardingState);
                    
                    return (
                        <StepItem
                            key={step.id}
                            step={step}
                            index={index}
                            isCompleted={stepInteraction.isCompleted}
                            isCurrent={stepInteraction.isCurrent}
                            canInteract={stepInteraction.canInteract}
                            onClick={() => onStepClick(index)}
                        />
                    );
                })}
            </div>

            {/* Información de progreso */}
            <div className="text-center text-sm text-custom-blackSemi/70 dark:text-white/70">
                <p>
                    Paso {onboardingState.showContent ? onboardingState.activeContent + 1 : 1} de {ONBOARDING_STEPS_CONFIG.length}
                    {progressPercentage === 100 && (
                        <span className="ml-2 text-green-600 font-medium">
                            ¡Completado!
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default StepProgress;
