import Icon from '@/imports/LucideIcon';
import ManagerCard from '@/Components/Shared/ManagerCard';

/**
 * Componente para mostrar el contenido del equipo (diseño original del backup)
 * @param {Object} props - Props del componente
 * @param {boolean} props.animate - Si debe animar
 * @param {Object} props.managerInfo - Información del manager
 * @param {Object} props.departamento - Información del departamento
 * @returns {JSX.Element}
 */
const TeamContent = ({ animate, managerInfo, departamento }) => (
    <div className={`w-full h-full transition-all duration-500 ${
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row gap-20 items-center justify-center w-full h-full">
            <div className="text-custom-blackSemi dark:text-white font-medium space-y-3 text-justify w-1/2 transition-all duration-500 bg-white dark:bg-custom-blackLight p-4 rounded-xl">
                <h2 className="text-2xl font-bold text-custom-orange mb-5">Conoce a tu responsable</h2>
                <b>
                    Ahora que ya sabes quiénes somos y hacia dónde vamos, toca hablarte de alguien muy importante 
                    en tu día a día: <span className="text-custom-orange">tu manager</span>.
                </b>
                <p>
                    En Empresa creemos en el liderazgo cercano, el acompañamiento constante y la comunicación clara. 
                    Por eso, desde tu primer día, contarás con una persona de referencia en tu departamento que estará contigo 
                    para resolver dudas, guiarte en tus tareas y ayudarte a crecer profesionalmente.
                </p>
                <p>
                    Tu responsable directo será <span className="font-bold">{managerInfo?.nombreCompleto ?? 'Nombre del Manager'}</span>, 
                    quien lidera el equipo de <span className="font-bold">{departamento?.nombre ?? 'Departamento'}</span> con 
                    experiencia, compromiso y un enfoque colaborativo. Además de explicarte cómo funcionamos internamente, 
                    será quien te marque los objetivos iniciales y te ayude a avanzar paso a paso.
                </p>
                <p>
                    Puedes contar con tu responsable para todo lo que necesites: desde una reunión rápida para revisar tareas 
                    hasta una charla tranquila para poner ideas en común. Aquí, el liderazgo se basa en la confianza.
                </p>
            </div>
            
            <ManagerCard 
                managerInfo={managerInfo}
                departamento={departamento}
                variant="onboarding"
                className="w-1/2 h-4/5"
            />
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
            {/* Header */}
            <div className="text-custom-blackSemi dark:text-white text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-custom-orange mb-3">
                    Conoce a tu responsable
                </h2>
            </div>

            {/* Manager Card */}
            <ManagerCard 
                managerInfo={managerInfo}
                departamento={departamento}
                variant="compact"
            />

            {/* Content */}
            <div className="text-custom-blackSemi dark:text-white font-medium space-y-4 text-justify bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base">
                    <b>
                        Ahora que ya sabes quiénes somos y hacia dónde vamos, toca hablarte de alguien muy importante 
                        en tu día a día: <span className="text-custom-orange">tu manager</span>.
                    </b>
                </p>
                <p className="text-sm sm:text-base">
                    En Empresa creemos en el liderazgo cercano, el acompañamiento constante y la comunicación clara. 
                    Por eso, desde tu primer día, contarás con una persona de referencia en tu departamento que estará contigo 
                    para resolver dudas, guiarte en tus tareas y ayudarte a crecer profesionalmente.
                </p>
                <p className="text-sm sm:text-base">
                    Tu responsable directo será <span className="font-bold">{managerInfo?.nombreCompleto ?? 'Nombre del Manager'}</span>, 
                    quien lidera el equipo de <span className="font-bold">{departamento?.nombre ?? 'Departamento'}</span> con 
                    experiencia, compromiso y un enfoque colaborativo. Además de explicarte cómo funcionamos internamente, 
                    será quien te marque los objetivos iniciales y te ayude a avanzar paso a paso.
                </p>
                <p className="text-sm sm:text-base">
                    Puedes contar con tu responsable para todo lo que necesites: desde una reunión rápida para revisar tareas 
                    hasta una charla tranquila para poner ideas en común. Aquí, el liderazgo se basa en la confianza.
                </p>
            </div>
        </div>
    </div>
);

export default TeamContent;
