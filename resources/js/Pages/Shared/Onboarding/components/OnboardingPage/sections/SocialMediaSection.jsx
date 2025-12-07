import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para la sección de redes sociales
 * @param {Object} props - Props del componente
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const SocialMediaSection = ({ isMobile = false }) => {
    const socialLinks = [
        {
            name: 'Sitio web oficial',
            icon: 'Globe',
            url: 'https://empresa.com/'
        },
        {
            name: 'Facebook',
            icon: 'Facebook',
            url: 'https://www.facebook.com/empresa'
        },
        {
            name: 'Instagram',
            icon: 'Instagram',
            url: 'https://www.instagram.com/empresa/#'
        },
        {
            name: 'YouTube',
            icon: 'Youtube',
            url: 'https://www.youtube.com/c/empresa'
        },
        {
            name: 'LinkedIn',
            icon: 'Linkedin',
            url: 'https://www.linkedin.com/company/empresa/'
        },
        {
            name: 'WhatsApp',
            icon: 'whatsapp', // Custom icon
            url: 'https://api.whatsapp.com/send?phone=125478996'
        },
        {
            name: 'TikTok',
            icon: 'tiktok', // Custom icon
            url: 'https://www.tiktok.com/@empresa'
        }
    ];

    if (isMobile) {
        return (
            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-4">
                <h3 className="text-lg font-bold text-custom-orange mb-4 text-center">Síguenos</h3>
                <div className="flex justify-center flex-wrap gap-3 md:gap-4 pb-3">
                    {socialLinks.map((link, index) => (
                        <MobileSocialLink key={index} link={link} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row justify-around mt-6 gap-1">
            {socialLinks.map((link, index) => (
                <DesktopSocialLink key={index} link={link} />
            ))}
        </div>
    );
};

/**
 * Componente para enlace social en vista móvil
 */
const MobileSocialLink = ({ link }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <a 
                        className="bg-custom-blue/30 dark:bg-custom-orange/30 p-3 md:p-4 rounded-xl" 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        {link.icon === 'whatsapp' ? (
                            <WhatsAppIcon className="w-5 h-5 md:w-6 md:h-6 text-custom-blue dark:text-custom-orange" />
                        ) : link.icon === 'tiktok' ? (
                            <TikTokIcon className="w-5 h-5 md:w-6 md:h-6 text-custom-blue dark:text-custom-orange" />
                        ) : (
                            <Icon name={link.icon} className="w-5 h-5 md:w-6 md:h-6 text-custom-blue dark:text-custom-orange" />
                        )}
                    </a>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{link.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Componente para enlace social en vista desktop
 */
const DesktopSocialLink = ({ link }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <a 
                        className="bg-custom-blue/30 dark:bg-custom-orange/30 p-3 rounded-xl" 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        {link.icon === 'whatsapp' ? (
                            <WhatsAppIcon className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
                        ) : link.icon === 'tiktok' ? (
                            <TikTokIcon className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
                        ) : (
                            <Icon name={link.icon} className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
                        )}
                    </a>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{link.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Componente para el icono de WhatsApp
 */
const WhatsAppIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={className} viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
);

/**
 * Componente para el icono de TikTok
 */
const TikTokIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={className} viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
    </svg>
);

export default SocialMediaSection;
