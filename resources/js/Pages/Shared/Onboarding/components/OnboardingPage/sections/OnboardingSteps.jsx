import Icon from '@/imports/LucideIcon';

/**
 * Componente para mostrar la lista de pasos del onboarding
 * @param {Object} props - Props del componente
 * @param {Object} props.visitedSteps - Pasos visitados
 * @param {function} props.onStepClick - Función para manejar click en paso
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const OnboardingSteps = ({ visitedSteps, onStepClick, isMobile = false }) => {
    const steps = [
        {
            id: 'step1',
            stepNumber: 1,
            title: 'Comprueba tu información personal en tu',
            highlightText: 'perfil',
            url: '/user/profile'
        },
        {
            id: 'step2',
            stepNumber: 2,
            title: 'Entra en la página de',
            highlightText: 'Organigrama',
            subtitle: 'y conoce la empresa',
            url: '/organization'
        },
        {
            id: 'step3',
            stepNumber: 3,
            title: 'Entra en',
            highlightText: 'Eventos',
            subtitle: 'y mira tu calendario',
            url: '/user/eventos'
        },
        {
            id: 'step4',
            stepNumber: 4,
            title: 'Entra en',
            highlightText: 'Vacaciones',
            subtitle: 'para pedir tus días libres',
            url: '/user/vacaciones'
        },
        {
            id: 'step5',
            stepNumber: 5,
            title: 'Entra en',
            highlightText: 'Horarios',
            subtitle: 'e infórmate de tus jornadas y días libres',
            url: '/user/horarios'
        }
    ];

    if (isMobile) {
        return (
            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-custom-orange mb-4 md:mb-6">Pasos del Onboarding</h3>
                <div className="space-y-3 md:space-y-4">
                    {steps.map((step) => (
                        <MobileStepItem
                            key={step.id}
                            step={step}
                            isVisited={visitedSteps[step.id]}
                            onStepClick={onStepClick}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mt-6">
            <h3 className="text-lg font-bold text-custom-orange mb-4">Pasos del Onboarding</h3>
            {steps.map((step) => (
                <DesktopStepItem
                    key={step.id}
                    step={step}
                    isVisited={visitedSteps[step.id]}
                    onStepClick={onStepClick}
                />
            ))}
        </div>
    );
};

/**
 * Componente para un paso en vista móvil
 */
const MobileStepItem = ({ step, isVisited, onStepClick }) => {
    return (
        <div className="flex items-center space-x-3 md:space-x-4">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                isVisited ? 'bg-custom-orange' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
                <Icon 
                    name="Check" 
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                        isVisited ? 'text-white' : 'text-gray-400'
                    }`} 
                />
            </div>
            <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Paso {step.stepNumber}</p>
                <button
                    onClick={() => onStepClick(step.id, step.url)}
                    className={`text-sm md:text-base font-medium hover:underline text-left ${
                        isVisited ? 'text-gray-400' : 'text-custom-blue dark:text-white'
                    }`}
                >
                    {step.title} <span className="text-custom-orange">{step.highlightText}</span>
                    {step.subtitle && ` ${step.subtitle}`}
                </button>
            </div>
        </div>
    );
};

/**
 * Componente para un paso en vista desktop
 */
const DesktopStepItem = ({ step, isVisited, onStepClick }) => {
    return (
        <div className="flex flex-row items-center p-2 gap-3">
            <div className={`w-8 aspect-square bg-custom-gray-semiLight/30 dark:bg-custom-gray-darker/30 p-2 rounded-lg flex items-center justify-center ${
                isVisited ? 'bg-custom-orange/30 dark:bg-custom-orange/30' : ''
            }`}>
                <Icon
                    name="Check"
                    className={`w-4 h-4 ${
                        isVisited ? 'text-custom-orange' : 'text-custom-gray-semiLight dark:text-custom-gray-darker'
                    }`}
                />
            </div>
            <div className="flex flex-col items-start justify-center">
                <h1 className="text-xs italic">Paso {step.stepNumber}</h1>
                <p className={`text-sm font-medium ${
                    isVisited ? 'text-custom-gray-semiDark/50' : 'text-custom-gray-semiDark dark:text-custom-white'
                }`}>
                    {step.title} {""}
                    <button
                        className={`hover:underline ${
                            isVisited ? 'text-custom-gray-darker/50' : 'text-custom-orange'
                        }`}
                        onClick={() => onStepClick(step.id, step.url)}
                    >
                        {step.highlightText}
                    </button>
                    {step.subtitle && ` ${step.subtitle}`}
                </p>
            </div>
        </div>
    );
};

export default OnboardingSteps;
