import { useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function EntitySelector({ prevEntityId, entityType, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [entities, setEntities] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');
    
    // Determinar el título según el tipo de entidad
    const getEntityTitle = () => {
        switch(entityType) {
            case 'Equipo': return 'Equipo';
            case 'Empresa': return 'Empresa';
            case 'Departamento': return 'Departamento';
            default: return 'Entidad';
        }
    };

    // Memoriza la función de selección
    const manageSelection = useCallback((entity) => {
        if (onSelect) {
            onSelect(entity);
        }
    }, [onSelect]);

    // Actualiza la entidad seleccionada cuando cambia prevEntityId
    useEffect(() => {
        if (prevEntityId) {
            const entity = entities.find((entity) => entity.id === prevEntityId);
            if (entity) {
                setSelectedEntity(entity);
            }
        } else {
            setSelectedEntity(null);
        }
    }, [prevEntityId, entities]);

    // Realiza la petición HTTP para obtener las entidades
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!fetchUrl) {
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(route(fetchUrl));
                if (response.status === 200) {
                    // Manejar diferentes estructuras de respuesta
                    let data = [];
                    
                    if (entityType === 'Equipo') {
                        data = response.data.teams || [];
                        
                    } else if (entityType === 'Empresa') {
                        data = response.data.empresas || [];
                        
                    } else if (entityType === 'Departamento') {
                        data = response.data.departments || [];
                        
                    } else {
                        // Intenta encontrar datos en varias propiedades comunes
                        const keys = ['data', entityType.toLowerCase() + 's', 'items', 'results'];
                        for (const key of keys) {
                            if (response.data[key]) {
                                data = response.data[key];
                                break;
                            }
                        }
                        
                        // Si aún no encontramos datos, usar directamente la respuesta
                        if (!data.length && Array.isArray(response.data)) {
                            data = response.data;
                        }
                    }
                    
                    setEntities(data);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUrl, entityType]);

    // Lista de entidades memorizada
    const entitiesList = useMemo(() => {
        return entities.map((entity) => (
            <CommandItem
                key={entity.id}
                value={entity.id.toString()}
                onSelect={() => {
                    (entity.id === selectedEntity?.id)
                        ? setSelectedEntity(null)
                        : setSelectedEntity(entity);
                    setOpen(false);
                    manageSelection(entity);
                }}
                className="hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium cursor-pointer transition-colors"
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4 text-custom-gray-darker dark:text-custom-white",
                        selectedEntity?.id === entity.id ? "opacity-100" : "opacity-0"
                    )}
                />
                <span className="text-custom-blackLight dark:text-custom-white text-sm">{entity.nombre || entity.name}</span>
            </CommandItem>
        ));
    }, [entities, selectedEntity, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium transition-colors ${className} text-sm flex px-4 py-2 h-10 items-center cursor-default focus:outline-none focus:ring-2 focus:ring-transparent`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedEntity ? (
                        <span className="truncate">{selectedEntity.nombre || selectedEntity.name}</span>
                    ) : (
                        <span className="text-gray-500">Selecciona {getEntityTitle()}</span>
                    )}
                    <Icon name="ChevronDown" className="ml-2 h-4 w-4 shrink-0 opacity-70 transition-transform duration-200" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2 bg-white dark:bg-custom-blackSemi border border-gray-300 dark:border-gray-600 shadow-xl">
                <Command>
                    <CommandInput 
                        className="rounded-full text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackMedium placeholder:text-gray-500 focus:outline-none focus:ring-transparent active:ring-transparent focus:border-transparent mb-2" 
                        placeholder={`Buscar ${getEntityTitle().toLowerCase()}...`} 
                    />
                    <CommandList>
                        <CommandEmpty>
                            {error
                                ? <span className="text-red-500 text-sm">Error al cargar los datos.</span>
                                : <span className="text-gray-500 text-sm">Ningún {getEntityTitle().toLowerCase()} encontrado</span>
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Icon name="Loader" className="h-5 w-5 animate-spin text-gray-500" />
                                </div>
                            ) : entitiesList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
