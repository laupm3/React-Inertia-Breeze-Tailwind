import { Button } from '@/Components/App/Buttons/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { router } from '@inertiajs/react';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para la sección de presentación
 * @param {Object} props - Props del componente
 * @param {function} props.onPresentationClick - Función para manejar click en presentación
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const PresentationSection = ({ onPresentationClick, isMobile = false }) => {
    if (isMobile) {
        return (
            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold">Presentación</h1>
                        <p className="text-sm text-gray-400">Vuelve a ver la presentación a la empresa.</p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="hover:bg-custom-orange/20 rounded-full p-2"
                                    onClick={onPresentationClick}
                                >
                                    <Icon name="RotateCcw" className="w-6 h-6 text-custom-orange" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver presentación de la empresa</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl flex flex-row items-center justify-between p-4">
            <div className="space-y-1 gap-10">
                <h1 className="text-lg font-bold">Presentación</h1>
                <p className="text-sm">
                    Vuelve a ver la presentación a la empresa.
                </p>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            className="hover:bg-custom-orange/20 items-center justify-center rounded-full p-2"
                            onClick={onPresentationClick}
                        >
                            <Icon
                                name="RotateCcw"
                                className="w-6 h-6 text-custom-orange"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver presentación de la empresa</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

/**
 * Componente para las secciones de acceso rápido (Organigrama y Eventos)
 * @param {Object} props - Props del componente
 * @param {boolean} props.isMobile - Si está en vista móvil
 * @returns {JSX.Element}
 */
const QuickAccessSection = ({ isMobile = false }) => {
    if (isMobile) {
        return (
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => router.visit('/organization')}
                    className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-6 flex flex-col relative overflow-hidden group"
                >
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-custom-blue dark:text-custom-white mb-2">Organigrama</h2>
                        <p className="text-sm text-gray-400">Ver el organigrama.</p>
                    </div>
                    <Icon
                        name="Network"
                        className="w-16 h-16 text-custom-orange absolute bottom-4 right-4 transform rotate-12 group-hover:scale-110 transition-transform"
                    />
                </button>

                <button
                    onClick={() => router.visit('/user/eventos')}
                    className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl p-6 flex flex-col relative overflow-hidden group"
                >
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-custom-blue dark:text-custom-white mb-2">Eventos</h2>
                        <p className="text-sm text-gray-400">Ver en el calendario los eventos programados.</p>
                    </div>
                    <Icon
                        name="CalendarDays"
                        className="w-16 h-16 text-custom-orange absolute bottom-4 right-4 transform rotate-12 group-hover:scale-110 transition-transform"
                    />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="space-y-5 flex flex-col items-start justify-start w-full">
                <button
                    onClick={() => router.visit('/organization')}
                    className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl h-64 p-6 overflow-hidden w-full justify-start items-start flex flex-col"
                >
                    <h1 className="text-2xl font-bold text-custom-blue dark:text-custom-white">Organigrama</h1>
                    <p className="text-lg">
                        Ver el organigrama.
                    </p>
                    <Icon name={"Network"} className="w-24 h-24 md:w-44 md:h-44 text-custom-orange relative top-12 md:left-32 md:top-10 left-20 -rotate-12" />
                </button>
                <button
                    onClick={() => router.visit('/user/eventos')}
                    className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-2xl h-40 md:h-64 p-4 md:p-6 overflow-hidden w-full justify-start items-start flex flex-col"
                >
                    <h1 className="text-xl md:text-2xl font-bold text-custom-blue dark:text-custom-white">
                        Eventos
                    </h1>
                    <p className="text-base md:text-lg text-left mt-2">
                        Ver en el calendario los eventos programados.
                    </p>
                    <Icon
                        name={"CalendarDays"}
                        className="w-16 h-16 md:w-44 md:h-44 text-custom-orange relative top-2 md:left-32 md:top-10 left-20 -rotate-12 self-end md:self-auto"
                    />
                </button>
            </div>
        </div>
    );
};

export { PresentationSection, QuickAccessSection };
