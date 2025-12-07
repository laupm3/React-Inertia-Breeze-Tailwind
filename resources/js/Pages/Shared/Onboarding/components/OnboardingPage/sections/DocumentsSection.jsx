import { Button } from '@/Components/App/Buttons/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { router } from '@inertiajs/react';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para la sección de documentos
 * @param {Object} props - Props del componente
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const DocumentsSection = ({ isMobile = false }) => {
    const documents = [
        {
            title: 'Plan de igualdad',
            description: 'Descargar PDF',
            icon: 'Download',
            action: () => console.log("Esther debería cobrar más"),
            disabled: true,
            tooltip: 'Descargar Plan de Igualdad'
        },
        {
            title: 'Políticas de Cookies',
            icon: 'Cookie',
            action: () => router.visit("/cookies-policy"),
            tooltip: 'Ver Políticas de Cookies'
        },
        {
            title: 'Políticas de Privacidad',
            icon: 'Shield',
            action: () => router.visit("/privacy-policy"),
            tooltip: 'Ver Políticas de Privacidad'
        },
        {
            title: 'Términos de Servicio',
            icon: 'FileText',
            action: () => router.visit("/terms-of-service"),
            tooltip: 'Ver Términos de Servicio'
        }
    ];

    if (isMobile) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-custom-orange">Documentos</h3>
                <div className="grid grid-cols-1 gap-3">
                    {documents.map((doc, index) => (
                        <MobileDocumentItem key={index} document={doc} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="mt-10">
            <h1 className="text-xl text-custom-orange font-black">Documentos</h1>
            <div className="grid grid-cols-2 gap-4 mt-4 h-auto">
                {documents.map((doc, index) => (
                    <DesktopDocumentItem key={index} document={doc} />
                ))}
            </div>
        </section>
    );
};

/**
 * Componente para documento en vista móvil
 */
const MobileDocumentItem = ({ document }) => {
    return (
        <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4 flex items-center justify-between">
            <div>
                <h4 className="text-base font-bold">{document.title}</h4>
                {document.description && (
                    <p className="text-sm text-gray-400">{document.description}</p>
                )}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            disabled={document.disabled}
                            onClick={document.action}
                        >
                            <Icon name={document.icon} className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{document.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

/**
 * Componente para documento en vista desktop
 */
const DesktopDocumentItem = ({ document }) => {
    return (
        <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl flex flex-row items-center justify-between p-4">
            <div className="space-y-1 gap-10">
                <h1 className="text-lg font-bold">{document.title}</h1>
                {document.description && (
                    <p className="text-sm">{document.description}</p>
                )}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            disabled={document.disabled}
                            onClick={document.action}
                        >
                            <Icon
                                name={document.icon}
                                className="w-6 h-6"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{document.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default DocumentsSection;
