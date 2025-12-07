import Pill from "@/Components/App/Pills/Pill";
import EntitySelector from "@/Components/App/Events/EntitySelector";
import Icon from "@/imports/LucideIcon";
import { useState, useEffect, useRef } from "react";

function SwitcherEventType({ selectedEventType, setSelectedEventType, eventTypes, onEntitySelect, initialEntity }) {
    const [selectedEntity, setSelectedEntity] = useState(initialEntity || null);
    const [currentEventType, setCurrentEventType] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Actualiza el tipo de evento actual cuando cambia selectedEventType
    useEffect(() => {
        if (selectedEventType) {
            const eventType = eventTypes.find(type => type.id === selectedEventType);
            setCurrentEventType(eventType);
        } else {
            setCurrentEventType(null);
        }
    }, [selectedEventType, eventTypes]);

    // Actualiza el estado con la entidad inicial
    useEffect(() => {
        if (initialEntity) {
            setSelectedEntity(initialEntity);
        }
    }, [initialEntity]);

    // Determina si el tipo de evento seleccionado requiere un selector de entidad
    const requiresEntitySelector = (typeName) => {
        const specialTypes = ['Equipo', 'Empresa', 'Departamento'];
        return specialTypes.includes(typeName);
    };

    // Determina la URL para obtener los datos según el tipo de entidad
    const getEntityFetchUrl = (typeName) => {
        switch(typeName) {
            case 'Equipo': return 'api.v1.user.eventos.teams';
            case 'Empresa': return 'api.v1.user.eventos.empresas';
            case 'Departamento': return 'api.v1.user.eventos.departamentos';
            default: return null;
        }
    };

    // Función para manejar la selección de entidad
    const handleEntitySelect = (entity) => {
        setSelectedEntity(entity);
        if (onEntitySelect) {
            onEntitySelect(entity);
        }
    };

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
        setSelectedEventType(typeId);
        setIsDropdownOpen(false);
        
        const eventType = eventTypes.find(type => type.id === typeId);
        if (!requiresEntitySelector(eventType?.nombre)) {
            setSelectedEntity(null);
            if (onEntitySelect) {
                onEntitySelect(null);
            }
        }
    };

    // Obtener el tipo de evento seleccionado
    const getSelectedEventTypeObj = () => {
        return eventTypes.find(type => type.id === selectedEventType);
    };

    return (
        <div className="space-y-3 w-full">
            {/* Error message */}
            {selectedEventType === null && (
                <p className="text-red-500 text-xs">
                    * Selecciona un tipo de evento
                </p>
            )}
            
            {/* Contenedor principal horizontal */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                {/* Selector de tipo de evento */}
                <div className="relative flex-1" ref={dropdownRef}>
                    <button
                        type="button"
                        className="w-full px-3 py-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white border-transparent focus:border-none focus:outline-none flex justify-between items-center hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium transition-colors h-10"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {selectedEventType ? (
                            <div className="flex items-center justify-between w-full">
                                <Pill
                                    identifier={getSelectedEventTypeObj()?.nombre}
                                    mapColor={DYNAMIC_COLOR_MAP}
                                    className="text-xs px-2 py-1"
                                >
                                    {getSelectedEventTypeObj()?.nombre}
                                </Pill>
                                <Icon 
                                    name="ChevronDown" 
                                    className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <span className="text-gray-500 text-sm">Selecciona un tipo de evento</span>
                                <Icon 
                                    name="ChevronDown" 
                                    className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                />
                            </div>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-wrap rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-custom-blackSemi shadow-xl overflow-hidden">
                            <div className="py-2 px-2 space-y-2">
                                {eventTypes.map((eventType) => (
                                    <div 
                                        key={eventType.id}
                                        className="transition-all duration-200 cursor-pointer"
                                        onClick={() => handleEventTypeSelect(eventType.id)}
                                    >
                                        <Pill
                                            identifier={eventType.nombre}
                                            mapColor={DYNAMIC_COLOR_MAP}
                                            className={`text-sm border-2 transition-all duration-200 ${
                                                selectedEventType === eventType.id
                                                    ? `${DYNAMIC_COLOR_MAP[eventType.nombre]?.border}`
                                                    : `border-transparent hover:${DYNAMIC_COLOR_MAP[eventType.nombre]?.border}`
                                            }`}
                                        >
                                            <span className="flex items-center justify-center">
                                                {eventType.nombre}
                                            </span>
                                        </Pill>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selector de entidad (cuando es necesario) */}
                {currentEventType && requiresEntitySelector(currentEventType.nombre) && (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-sm font-medium text-nowrap whitespace-nowrap">
                            {currentEventType.nombre}:
                        </label>
                        <EntitySelector
                            entityType={currentEventType.nombre}
                            fetchUrl={getEntityFetchUrl(currentEventType.nombre)}
                            prevEntityId={selectedEntity?.id}
                            className="w-full"
                            onSelect={handleEntitySelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default SwitcherEventType;