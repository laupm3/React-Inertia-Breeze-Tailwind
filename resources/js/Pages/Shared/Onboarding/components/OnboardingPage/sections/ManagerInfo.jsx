import { Button } from '@/Components/App/Buttons/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para mostrar información del manager
 * @param {Object} props - Props del componente
 * @param {Object} props.managerInfo - Información del manager
 * @param {Object} props.departamento - Información del departamento
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const ManagerInfo = ({ managerInfo, departamento, isMobile = false }) => {
    if (isMobile) {
        return (
            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl overflow-hidden">
                <div className="p-4">
                    <h3 className="text-lg font-bold text-custom-orange mb-4">Tu mánager</h3>
                    <div className="flex items-center space-x-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url('${managerInfo?.user?.profile_photo_url ?? "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}')`
                            }}
                        />
                        <div>
                            <h4 className="text-lg font-bold text-custom-blue dark:text-custom-white">
                                {managerInfo?.nombreCompleto ?? 'Nombre del Manager'}
                            </h4>
                            <p className="text-sm text-gray-400">
                                Mánager del departamento de {departamento?.nombre ?? 'sin especificar'}
                            </p>
                        </div>
                    </div>
                    <ContactInfo managerInfo={managerInfo} isMobile={true} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1 className="text-xl text-custom-orange font-black mb-2">Tu mánager</h1>
            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl overflow-hidden w-full shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
                <div
                    className="relative w-full h-96 bg-cover bg-center flex items-end p-4"
                    style={{
                        backgroundImage: `url('${managerInfo?.user?.profile_photo_url ?? "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"}')`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <h3 className="text-lg font-bold">{managerInfo?.nombreCompleto ?? 'Nombre del Manager'}</h3>
                        <p className="text-sm">Mánager del departamento de {departamento?.nombre ?? 'sin especificar'}</p>
                    </div>
                </div>
                <div className="w-full bg-custom-white dark:bg-custom-blackSemi p-3">
                    <ContactInfo managerInfo={managerInfo} isMobile={false} />
                </div>
            </div>
        </div>
    );
};

/**
 * Componente para la información de contacto del manager
 */
const ContactInfo = ({ managerInfo, isMobile }) => {
    const containerClasses = isMobile ? "flex justify-around" : "flex justify-around items-center";

    return (
        <div className={containerClasses}>
            <div className="text-center">
                <div className="w-10 h-10 bg-custom-orange/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Icon name="Blocks" className="w-5 h-5 text-custom-orange" />
                </div>
                <span className={`text-xs ${isMobile ? 'text-gray-400' : 'text-custom-blackSemi dark:text-white'}`}>
                    {managerInfo?.extension_centrex ?? (isMobile ? '376' : 'Ext.')}
                </span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-custom-orange/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Icon name="Mail" className="w-5 h-5 text-custom-orange" />
                </div>
                <span className={`text-xs ${isMobile ? 'text-gray-400' : 'text-custom-blackSemi dark:text-white'} text-center`}>
                    {isMobile 
                        ? 'correo@empresa.com'
                        : (managerInfo?.email ? managerInfo.email.split('@')[0] : 'Email')
                    }
                </span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-custom-orange/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Icon name="Phone" className="w-5 h-5 text-custom-orange" />
                </div>
                <span className={`text-xs ${isMobile ? 'text-gray-400' : 'text-custom-blackSemi dark:text-white'}`}>
                    {managerInfo?.telefono ?? (isMobile ? '912 345 678' : 'Tel.')}
                </span>
            </div>
        </div>
    );
};

export default ManagerInfo;
