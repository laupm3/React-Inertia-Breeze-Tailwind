import Icon from '@/imports/LucideIcon';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';

/**
 * Componente para mostrar información del manager
 * @param {Object} props - Props del componente
 * @param {Object} props.managerInfo - Información del manager
 * @param {Object} props.departamento - Información del departamento
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.variant - Variante del diseño: 'default' | 'onboarding' | 'compact'
 * @returns {JSX.Element}
 */
const ManagerCard = ({ managerInfo, departamento, className = '', variant = 'default' }) => {
    const hasPhoto = managerInfo?.user?.profile_photo_url;
    const managerName = managerInfo?.nombreCompleto || 'Nombre del Manager';
    const departmentName = departamento?.nombre || 'sin especificar';
    const email = managerInfo?.email || 'email@coreos.com';
    const phone = managerInfo?.telefono;
    const extension = managerInfo?.extension_centrex || 'Extensión';

    // Diseño tipo onboarding (como el backup)
    if (variant === 'onboarding') {
        return (
            <div className={`flex flex-col items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${className}`}>
                <div
                    className="relative w-full h-96 flex items-end p-6 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${hasPhoto ? managerInfo.user.profile_photo_url : "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}')`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <h3 className="text-2xl font-bold">{managerName}</h3>
                        <p className="text-base font-medium">
                            Mánager del departamento de {departmentName}
                        </p>
                    </div>
                </div>
                <div className="w-full bg-custom-white dark:bg-custom-blackSemi p-6 flex justify-around items-center h-1/3">
                    {[
                        { icon: "Blocks", label: "Extensión", value: extension },
                        { icon: "Mail", label: "Correo electrónico", value: email },
                        { icon: "Phone", label: "Teléfono", value: phone || '...' }
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="bg-custom-orange/20 rounded-full p-4">
                                            <Icon name={item.icon} className="w-6 h-6 text-custom-orange" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{item.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-sm text-custom-blackSemi dark:text-white font-medium text-center">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Diseño compacto para móvil onboarding
    if (variant === 'compact') {
        return (
            <div className={`flex flex-col items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl overflow-hidden shadow-lg transition-all duration-500 ${className}`}>
                <div
                    className="relative w-full h-48 sm:h-56 flex items-end p-4 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${hasPhoto ? managerInfo.user.profile_photo_url : "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}')`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <h3 className="text-lg sm:text-xl font-bold">{managerName}</h3>
                        <p className="text-sm font-medium">
                            Mánager del departamento de {departmentName}
                        </p>
                    </div>
                </div>
                
                {/* Contact Info */}
                <div className="w-full bg-custom-white dark:bg-custom-blackSemi p-4">
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: "Blocks", label: "Extensión", value: extension },
                            { icon: "Mail", label: "Correo electrónico", value: email },
                            { icon: "Phone", label: "Teléfono", value: phone || '...' }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="bg-custom-orange/20 rounded-full p-2 sm:p-3">
                                                <Icon name={item.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-custom-orange" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span className="text-xs text-custom-blackSemi dark:text-white text-center break-words">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Diseño por defecto (original mejorado)
    return (
        <div className={`bg-white dark:bg-custom-blackSemi rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full ${className}`}>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="relative mx-auto w-32 h-32 mb-6">
                    {hasPhoto ? (
                        <img
                            src={managerInfo.user.profile_photo_url}
                            alt={`Foto de ${managerName}`}
                            className="w-full h-full rounded-full object-cover border-4 border-custom-orange/20"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div 
                        className={`w-full h-full rounded-full bg-custom-orange/20 flex items-center justify-center ${hasPhoto ? 'hidden' : 'flex'}`}
                    >
                        <Icon name="User" className="w-16 h-16 text-custom-orange" />
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-custom-blackSemi dark:text-white mb-2">
                    {managerName}
                </h3>
                <p className="text-base text-custom-blackSemi/70 dark:text-white/70 font-medium">
                    Manager de {departmentName}
                </p>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
                {email && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-custom-blackSemi">
                        <Icon name="Mail" className="w-6 h-6 text-custom-orange flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-custom-blackSemi/60 dark:text-white/60 mb-1 font-medium">
                                Email
                            </p>
                            <a
                                href={`mailto:${email}`}
                                className="text-base text-custom-blackSemi dark:text-white hover:text-custom-orange dark:hover:text-custom-orange transition-colors truncate block"
                            >
                                {email}
                            </a>
                        </div>
                    </div>
                )}

                {phone && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-custom-blackSemi">
                        <Icon name="Phone" className="w-6 h-6 text-custom-orange flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-custom-blackSemi/60 dark:text-white/60 mb-1 font-medium">
                                Teléfono
                            </p>
                            <a
                                href={`tel:${phone}`}
                                className="text-base text-custom-blackSemi dark:text-white hover:text-custom-orange dark:hover:text-custom-orange transition-colors"
                            >
                                {phone}
                                {extension && (
                                    <span className="text-custom-blackSemi/60 dark:text-white/60">
                                        {' '}ext. {extension}
                                    </span>
                                )}
                            </a>
                        </div>
                    </div>
                )}

                {extension && !phone && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-custom-blackSemi">
                        <Icon name="Blocks" className="w-6 h-6 text-custom-orange flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-custom-blackSemi/60 dark:text-white/60 mb-1 font-medium">
                                Extensión
                            </p>
                            <p className="text-base text-custom-blackSemi dark:text-white">
                                {extension}
                            </p>
                        </div>
                    </div>
                )}

                {!email && !phone && !extension && (
                    <div className="text-center py-6">
                        <p className="text-base text-custom-blackSemi/60 dark:text-white/60">
                            Información de contacto no disponible
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-custom-blackSemi/50 dark:text-white/50 text-center">
                    No dudes en contactar para cualquier consulta
                </p>
            </div>
        </div>
    );
};

export default ManagerCard;
