import { Button } from '@/Components/App/Buttons/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para la sección de progreso y botones de acción
 * @param {Object} props - Props del componente
 * @param {number} props.progressPercentage - Porcentaje de progreso
 * @param {boolean} props.isComplete - Si está completo el onboarding
 * @param {function} props.onSkip - Función para omitir onboarding
 * @param {function} props.onComplete - Función para ir al dashboard
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const ProgressSection = ({ 
    progressPercentage, 
    isComplete, 
    onSkip, 
    onComplete, 
    isMobile = false 
}) => {
    const containerClasses = isMobile 
        ? "bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-4"
        : "rounded-2xl flex flex-col items-end justify-center mt-8 px-4 h-full";

    if (isMobile) {
        return (
            <div className={containerClasses}>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-custom-orange">
                        {Math.round(progressPercentage)}%
                    </span>
                    <span className="text-sm text-gray-400">completado</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-custom-orange h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                
                <ActionButtons 
                    isComplete={isComplete}
                    onSkip={onSkip}
                    onComplete={onComplete}
                    isMobile={true}
                />
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-2xl flex flex-col items-end justify-center mt-8 px-4">
                <h1 className="text-md">
                    <b>{Math.round(progressPercentage)}%</b> <i>completado</i>
                </h1>
                <div className="w-full bg-custom-gray-semiLight dark:bg-custom-blackSemi rounded-full h-2.5 mb-4">
                    <div
                        className="bg-custom-orange h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
            
            <div className="flex flex-col gap-2 p-4">
                <ActionButtons 
                    isComplete={isComplete}
                    onSkip={onSkip}
                    onComplete={onComplete}
                    isMobile={false}
                />
            </div>
        </div>
    );
};

/**
 * Componente para los botones de acción (omitir/completar)
 */
const ActionButtons = ({ isComplete, onSkip, onComplete, isMobile }) => {
    const buttonClasses = isMobile ? "w-full justify-center" : "";

    if (!isComplete) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className={`flex items-center gap-2 ${buttonClasses}`}
                            size="sm"
                        >
                            Omitir pasos
                            <Icon name="SkipForward" className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Completar todos los pasos automáticamente</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="default"
                        onClick={onComplete}
                        className={`flex items-center gap-2 bg-custom-orange hover:bg-custom-orange/90 text-white ${buttonClasses}`}
                        size="sm"
                    >
                        Ir al Dashboard
                        <Icon name="ArrowRight" className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>¡Onboarding completado! Ir al panel principal</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default ProgressSection;
