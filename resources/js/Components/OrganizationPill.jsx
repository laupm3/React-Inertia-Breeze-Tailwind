import { useState } from "react";
import Icon from "@/imports/LucideIcon";

function OrganizationPill({ image = "", name, job, phone, mail }) {
    const [showContact, setShowContact] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Calculate translation to move image from left edge of its flex container 
    // to the right edge of the main pill, accounting for padding and text container width.
    // w-96 (24rem) total width, p-2 (1rem total padding), w-16 (4rem) image.
    // Space for text is approx 24 - 1 - 4 = 19rem.
    // To move image from left to right edge of text area (approx 19rem) relative to its position:
    const translateXClass = showContact ? 'translate-x-[19rem]' : 'translate-x-0';

    /**
     * Función proxy para resolver problemas de CORS con imágenes de LinkedIn
     * 
     * Problema: LinkedIn bloquea el acceso directo a sus imágenes desde otros dominios
     * Solución: Usar un servicio proxy externo que descarga y sirve las imágenes
     * 
     * Beneficios del proxy:
     * - Evita errores ERR_BLOCKED_BY_CLIENT
     * - Optimiza tamaño (redimensiona a 64x64px)
     * - Aplica formato circular automáticamente
     * - Mejora velocidad de carga
     * 
     * @param {string} imageUrl - URL original de la imagen
     * @returns {string} URL procesada o original según el dominio
     */
    const getProxiedImageUrl = (imageUrl) => {
        
        if (!imageUrl) return '';
        
        // Si es una URL de LinkedIn, usar proxy externo
        if (imageUrl.includes('linkedin.com') || imageUrl.includes('licdn.com')) {
            return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=64&h=64&fit=cover&mask=circle`;
        }
        
        // Para otras URLs, usar directamente
        return imageUrl;
    };

    return (
        <div 
            className="relative flex items-center h-20 p-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-full cursor-pointer overflow-hidden text-custom-blackSemi dark:text-custom-gray-default mx-auto w-96"
            onClick={() => setShowContact(!showContact)}
        >
            {/* Contenedor de la imagen */}
            <div 
                className={`z-10 transition-transform duration-300 ease-in-out ${translateXClass}`}
            >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-custom-gray-semiLight dark:bg-custom-gray-darker overflow-hidden">
                    {image && !imageError ? (
                        <img 
                            src={getProxiedImageUrl(image)}
                            alt={name} 
                            className='w-full h-full rounded-full object-cover'
                            onError={() => setImageError(true)}
                            //onLoad={() => console.log('Image loaded:', image)}
                        />
                    ) : (
                        <Icon name={"User"} className={"text-custom-gray-darker dark:text-custom-blackLight"} />
                    )}
                </div>
            </div>

            {/* Contenedor para la información de texto */}
            <div className={`flex-1 relative flex flex-col items-center justify-center text-center px-4`}>

                 {/* Contenedor de la información personal */}
                 <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300 ${showContact ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                    <p className="font-bold text-lg">{name}</p>
                    <p className="text-xs">{job}</p>
                </div>

                {/* Contenedor de la información de contacto */}
                <div className={`-ml-10 absolute inset-0 flex flex-col items-start justify-center text-center transition-opacity duration-300 ${showContact ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <p className='flex flex-row items-center gap-2'>
                        <Icon name="Phone" className="h-4 w-4 " /> 
                        <span>{phone}</span>
                    </p>
                    <p className='flex flex-row items-center gap-2'>
                        <Icon name="Mail" className="h-4 w-4 " /> 
                        <span>{mail}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrganizationPill;
