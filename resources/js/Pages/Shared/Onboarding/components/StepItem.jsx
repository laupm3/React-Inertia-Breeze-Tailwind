import Icon from '@/imports/LucideIcon';
import { getStepClasses, getIconClasses } from '../constants/index.js';

/**
 * Componente para mostrar un item de paso del onboarding
 * @param {Object} props - Props del componente
 * @param {Object} props.step - Información del paso
 * @param {number} props.index - Índice del paso
 * @param {boolean} props.isCompleted - Si está completado
 * @param {boolean} props.isCurrent - Si es el paso actual
 * @param {boolean} props.canInteract - Si se puede interactuar
 * @param {function} props.onClick - Callback para click
 * @returns {JSX.Element}
 */
const StepItem = ({ 
    step, 
    index, 
    isCompleted, 
    isCurrent, 
    canInteract, 
    onClick 
}) => {
    const handleClick = () => {
        if (canInteract && onClick) {
            onClick();
        }
    };

    const handleKeyDown = (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && canInteract && onClick) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={getStepClasses(isCompleted, isCurrent, canInteract)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={canInteract ? "button" : "presentation"}
            tabIndex={canInteract ? 0 : -1}
            aria-label={`${step.title} - ${isCompleted ? 'Completado' : isCurrent ? 'Actual' : 'Pendiente'}`}
            style={{
                pointerEvents: canInteract ? 'auto' : 'none',
                cursor: canInteract ? 'pointer' : 'default'
            }}
        >
            <div className={getIconClasses(isCompleted)}>
                {isCompleted ? (
                    <Icon 
                        name="Check" 
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        aria-hidden="true"
                    />
                ) : (
                    <Icon 
                        name={step.icon} 
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        aria-hidden="true"
                    />
                )}
            </div>
            
            <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-custom-blackSemi dark:text-white truncate">
                    {step.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-custom-blackSemi/70 dark:text-white/70 line-clamp-2">
                    {step.description}
                </p>
            </div>
        </div>
    );
};

export default StepItem;
