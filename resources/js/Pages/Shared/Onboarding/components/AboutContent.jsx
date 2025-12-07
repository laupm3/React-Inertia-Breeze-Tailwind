import { ONBOARDING_IMAGES, getImageAlt } from '../constants/index.js';

/**
 * Componente para mostrar el contenido "Acerca de nosotros"
 * @param {Object} props - Props del componente
 * @param {boolean} props.animate - Si debe animar
 * @returns {JSX.Element}
 */
const AboutContent = ({ animate }) => {
    const baseTransitionClass = `transition-all duration-500 ${
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`;

    return (
        <div className={baseTransitionClass}>
            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-5 grid-rows-5 gap-4 w-full h-full">
                <div className="col-span-3 row-span-5 text-custom-blackSemi dark:text-white font-medium space-y-3 text-justify bg-custom-gray-default dark:bg-custom-blackLight rounded-xl p-7 transition-all duration-500">
                    <h2 className="text-lg font-bold text-custom-orange">
                        Formación que cambia vidas.
                    </h2>
                    <p>
                        Empresa nace en 2025 con una vocación clara: ofrecer formación accesible, actualizada y útil 
                        para trabajadores y personas desempleadas. Nos especializamos en acciones formativas subvencionadas, 
                        tanto por el SEPE como por la Comunidad de Madrid.
                    </p>
                    <p>
                        Nuestro propósito es sencillo pero potente: <strong>mejorar la empleabilidad y el desarrollo profesional 
                        de quienes confían en nosotros.</strong>
                    </p>
                    
                    <h3 className="text-lg font-bold text-custom-orange pt-2">
                        No formamos por formar. Formamos para transformar.
                    </h3>
                    <p>
                        En Empresa no entendemos la formación como una obligación, sino como una <strong>herramienta para 
                        mejorar vidas</strong>. Cada curso que gestionamos, cada aula que organizamos, cada tutoría que acompañamos... 
                        es una pieza más de un objetivo mayor: ayudar a las personas a <strong>acceder al empleo, mejorar profesionalmente 
                        y recuperar la confianza en sí mismas</strong>.
                    </p>
                    <p>
                        Como parte del equipo, tu trabajo tiene un impacto directo. A veces no lo verás en el momento, pero detrás 
                        de cada proceso hay un alumno que termina una formación y consigue una entrevista, un certificado o un nuevo rumbo.
                    </p>
                    <p>
                        <strong>Eso es lo que hacemos cada día. Y tú ya formas parte de ello.</strong>
                    </p>
                    
                    <h3 className="text-lg font-bold text-custom-orange pt-2">
                        Empezamos contigo.
                    </h3>
                    <p>
                        En Empresa creemos que las personas marcan la diferencia. Y hoy, con tu llegada, somos un equipo 
                        aún mejor. Estamos aquí para acompañarte, escucharte y crecer contigo. Porque este camino lo construimos 
                        entre todos. <strong>Bienvenido/a a casa.</strong>
                    </p>
                </div>
                
                <div 
                    className="col-span-2 row-span-5 col-start-4 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 bg-cover bg-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.about.classroom}")` }}
                    role="img"
                    aria-label={getImageAlt('classroom', 'about')}
                />
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden space-y-4">
                {/* Image */}
                <div 
                    className="w-full h-48 sm:h-64 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl bg-cover bg-center transition-all duration-500" 
                    style={{ backgroundImage: `url("${ONBOARDING_IMAGES.about.classroom}")` }}
                    role="img"
                    aria-label={getImageAlt('classroom', 'about')}
                />
                
                {/* Content */}
                <div className="text-custom-blackSemi dark:text-white font-medium space-y-4 text-justify bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-custom-orange">
                        Formación que cambia vidas.
                    </h2>
                    <p className="text-sm sm:text-base">
                        Empresa nace en 2025 con una vocación clara: ofrecer formación accesible, actualizada y útil 
                        para trabajadores y personas desempleadas. Nos especializamos en acciones formativas subvencionadas, 
                        tanto por el SEPE como por la Comunidad de Madrid.
                    </p>
                    <p className="text-sm sm:text-base">
                        Nuestro propósito es sencillo pero potente: <strong>mejorar la empleabilidad y el desarrollo profesional 
                        de quienes confían en nosotros.</strong>
                    </p>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-custom-orange">
                        No formamos por formar. Formamos para transformar.
                    </h3>
                    <p className="text-sm sm:text-base">
                        En Empresa no entendemos la formación como una obligación, sino como una <strong>herramienta para 
                        mejorar vidas</strong>. Cada curso que gestionamos, cada aula que organizamos, cada tutoría que acompañamos... 
                        es una pieza más de un objetivo mayor: ayudar a las personas a <strong>acceder al empleo, mejorar profesionalmente 
                        y recuperar la confianza en sí mismas</strong>.
                    </p>
                    <p className="text-sm sm:text-base">
                        Como parte del equipo, tu trabajo tiene un impacto directo. A veces no lo verás en el momento, pero detrás 
                        de cada proceso hay un alumno que termina una formación y consigue una entrevista, un certificado o un nuevo rumbo.
                    </p>
                    <p className="text-sm sm:text-base">
                        <strong>Eso es lo que hacemos cada día. Y tú ya formas parte de ello.</strong>
                    </p>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-custom-orange">
                        Empezamos contigo.
                    </h3>
                    <p className="text-sm sm:text-base">
                        En Empresa creemos que las personas marcan la diferencia. Y hoy, con tu llegada, somos un equipo 
                        aún mejor. Estamos aquí para acompañarte, escucharte y crecer contigo. Porque este camino lo construimos 
                        entre todos. <strong>Bienvenido/a a casa.</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutContent;
