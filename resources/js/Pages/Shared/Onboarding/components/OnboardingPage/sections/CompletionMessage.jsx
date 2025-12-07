import Icon from '@/imports/LucideIcon';

/**
 * Componente para mostrar mensaje de felicitación al completar onboarding
 * @param {Object} props - Props del componente
 * @param {boolean} props.show - Si mostrar el mensaje
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element|null}
 */
const CompletionMessage = ({ show, isMobile = false }) => {
    if (!show) return null;

    const baseClasses = "bg-gradient-to-r from-custom-orange to-yellow-400 text-white rounded-2xl p-4 animate-pulse";
    const mobileClasses = isMobile ? "mb-6" : "mb-4";

    return (
        <div className={`${baseClasses} ${mobileClasses}`}>
            <div className="flex items-center gap-3">
                <Icon name="PartyPopper" className={isMobile ? "w-8 h-8" : "w-6 h-6"} />
                <div>
                    <h3 className={`font-bold ${isMobile ? "text-lg" : "text-base"}`}>
                        ¡Felicitaciones! 🎉
                    </h3>
                    <p className={isMobile ? "text-sm" : "text-xs"}>
                        {isMobile 
                            ? "Has completado exitosamente el onboarding. ¡Bienvenido/a al equipo!"
                            : "¡Onboarding completado exitosamente!"
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompletionMessage;
