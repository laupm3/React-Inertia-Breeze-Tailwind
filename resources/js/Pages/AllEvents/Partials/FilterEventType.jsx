import Pill from "@/Components/App/Pills/Pill";
import { useState, useEffect, useRef } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import Icon from "@/imports/LucideIcon";

function FilterEventType({ eventTypes, selectedType, onTypeChange }) {
    const [open, setOpen] = useState(false);

    // Función para generar un mapa de colores dinámico de los Tipos de Eventos
    const generateColorMap = () => {
        const colorMap = {};
        eventTypes.forEach(eventType => {
            const hex = eventType.color;
            const className = `color-${eventType.id}`;

            // Se crea un estilo dinámico para cada tipo de evento
            if (!document.getElementById(`style-${eventType.id}`)) {
                const style = document.createElement('style');
                style.id = `style-${eventType.id}`;
                style.innerHTML = `
                    .${className}-point { background-color: ${hex}; }
                    .${className}-bg { background-color: ${hex}30; }
                    .${className}-text { color: ${hex}; }
                    .${className}-border { border-color: ${hex}; }
                `;
                document.head.appendChild(style);
            }
            
            colorMap[eventType.nombre] = {
                point: `${className}-point`,
                bg: `${className}-bg`,
                text: `${className}-text`,
                border: `${className}-border`
            };
        });
        return colorMap;
    };

    const DYNAMIC_COLOR_MAP = generateColorMap();

    // Función para manejar la selección de un tipo de evento
    const handleEventTypeSelect = (typeId) => {
        onTypeChange(typeId);
        setOpen(false);
    };

    // Obtener el tipo de evento seleccionado
    const getSelectedEventTypeObj = () => {
        return eventTypes.find(type => type.id === selectedType);
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="w-full px-3 py-2 rounded-full bg-custom-gray-light dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white border-transparent focus:border-none focus:outline-none flex justify-between items-center hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium transition-colors h-10"
                >
                    {selectedType ? (
                        <Pill
                            identifier={getSelectedEventTypeObj()?.nombre}
                            mapColor={DYNAMIC_COLOR_MAP}
                            className="text-xs px-2 py-1"
                        >
                            {getSelectedEventTypeObj()?.nombre}
                        </Pill>
                    ) : (
                        <span className="text-gray-500 text-sm">Todos los tipos</span>
                    )}
                    <Icon name="ChevronDown" className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2 bg-white dark:bg-custom-blackSemi border border-gray-300 dark:border-gray-600 shadow-xl">
                <Command>
                    <CommandList>
                        <CommandEmpty>
                            <span className="text-gray-500 text-sm">No hay tipos de eventos disponibles</span>
                        </CommandEmpty>
                        <CommandGroup>
                            {/* Opción "Todos" */}
                            <CommandItem
                                value="todos"
                                onSelect={() => handleEventTypeSelect(null)}
                                className="hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium cursor-pointer transition-colors"
                            >
                                <Icon name="Check"
                                    className={`mr-2 h-4 w-4 text-custom-gray-darker dark:text-custom-white ${
                                        selectedType === null ? "opacity-100" : "opacity-0"
                                    }`}
                                />
                                <span className="text-custom-blackLight dark:text-custom-white text-sm">Todos los tipos</span>
                            </CommandItem>

                            {/* Lista de tipos de evento */}
                            {Array.isArray(eventTypes) && eventTypes.length > 0 && (
                                eventTypes.map((eventType) => (
                                    <CommandItem
                                        key={eventType.id}
                                        value={eventType.id.toString()}
                                        onSelect={() => handleEventTypeSelect(eventType.id)}
                                        className="hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium cursor-pointer transition-colors"
                                    >
                                        <Icon name="Check"
                                            className={`mr-2 h-4 w-4 text-custom-gray-darker dark:text-custom-white ${
                                                selectedType === eventType.id ? "opacity-100" : "opacity-0"
                                            }`}
                                        />
                                        <Pill
                                            identifier={eventType.nombre}
                                            mapColor={DYNAMIC_COLOR_MAP}
                                            className="text-sm"
                                        >
                                            {eventType.nombre}
                                        </Pill>
                                    </CommandItem>
                                ))
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default FilterEventType;
