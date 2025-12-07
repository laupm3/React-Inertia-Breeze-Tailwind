import { ONBOARDING_IMAGES, getImageWithFallback, getImageAlt } from '../constants/index.js';

/**
 * Componente para mostrar el contenido de bienvenida
 * @param {Object} props - Props del componente
 * @param {boolean} props.animate - Si debe animar
 * @returns {JSX.Element}
 */
const WelcomeContent = ({ animate }) => {
    const baseTransitionClass = `transition-all duration-500 ${
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`;

    return (
        <div className={baseTransitionClass}>
            {/* Desktop Grid Layout */}
            <div className="hidden lg:grid grid-cols-5 grid-rows-5 gap-4 h-full">
                <div 
                    className="col-span-2 row-span-4 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.office1}")` }}
                    role="img"
                    aria-label={getImageAlt('office1', 'welcome')}
                />
                
                <div 
                    className="col-span-3 row-span-2 col-start-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-right transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.header}")` }}
                    role="img"
                    aria-label={getImageAlt('header', 'welcome')}
                />
                
                <div className="col-span-2 row-span-2 col-start-3 row-start-3 bg-custom-gray-default dark:bg-custom-blackLight rounded-xl p-4 text-custom-blackSemi dark:text-white font-medium space-y-3 text-justify transition-all duration-500 hover:scale-[1.02] hover:shadow-lg">
                    <h2 className="text-lg font-bold text-custom-orange mb-7">
                        ¡Estamos encantados de tenerte a bordo!
                    </h2>
                    <p>
                        Desde hoy formas parte de una organización que lleva casi 40 años impulsando la formación de calidad. 
                        En <span className="font-bold">Empresa</span> creemos en las personas, en el talento compartido 
                        y en el aprendizaje constante.
                    </p>
                    <p>
                        Aquí no solo se enseña: se transforma. Y tú ya formas parte de ese cambio
                    </p>
                    <p>
                        Gracias por unirte a nuestro equipo.
                    </p>
                </div>
                
                <div 
                    className="row-span-3 col-start-5 row-start-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.office2}")` }}
                    role="img"
                    aria-label={getImageAlt('office2', 'welcome')}
                />
                
                <div 
                    className="col-span-2 row-start-5 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.meeting}")` }}
                    role="img"
                    aria-label={getImageAlt('meeting', 'welcome')}
                />
                
                <div 
                    className="col-span-2 col-start-3 row-start-5 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.team}")` }}
                    role="img"
                    aria-label={getImageAlt('team', 'welcome')}
                />
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden space-y-3 sm:space-y-4 h-full">
                {/* Header Image */}
                <div 
                    className="w-full h-24 sm:h-32 md:h-40 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500 flex-shrink-0" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.header}")` }}
                    role="img"
                    aria-label={getImageAlt('header', 'welcome')}
                />
                
                {/* Main Content */}
                <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-3 sm:p-4 md:p-6 text-custom-blackSemi dark:text-white font-medium space-y-3 sm:space-y-4 text-justify flex-shrink-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-custom-orange">
                        ¡Estamos encantados de tenerte a bordo!
                    </h2>
                    <p className="text-sm sm:text-base">
                        Desde hoy formas parte de una organización que lleva casi 40 años impulsando la formación de calidad. 
                        En <span className="font-bold">Empresa</span> creemos en las personas, en el talento compartido 
                        y en el aprendizaje constante.
                    </p>
                    <p className="text-sm sm:text-base">
                        Aquí no solo se enseña: se transforma. Y tú ya formas parte de ese cambio
                    </p>
                    <p className="text-sm sm:text-base">
                        Gracias por unirte a nuestro equipo.
                    </p>
                </div>

                {/* Images Grid for Mobile */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                    <div 
                        className="aspect-square bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500" 
                        style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.office1}")` }}
                        role="img"
                        aria-label={getImageAlt('office1', 'welcome')}
                    />
                    <div 
                        className="aspect-square bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500" 
                        style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.office2}")` }}
                        role="img"
                        aria-label={getImageAlt('office2', 'welcome')}
                    />
                    <div 
                        className="aspect-square bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500" 
                        style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.meeting}")` }}
                        role="img"
                        aria-label={getImageAlt('meeting', 'welcome')}
                    />
                    <div 
                        className="aspect-square bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500" 
                        style={{ backgroundImage: `url("${ONBOARDING_IMAGES.welcome.team}")` }}
                        role="img"
                        aria-label={getImageAlt('team', 'welcome')}
                    />
                </div>
            </div>
        </div>
    );
};

export default WelcomeContent;
