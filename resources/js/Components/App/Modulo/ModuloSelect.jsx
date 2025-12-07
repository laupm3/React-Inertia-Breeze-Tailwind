import { useEffect, useState, useMemo, useCallback } from "react"

import { cn } from "@/lib/utils"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import Icon from "@/imports/LucideIcon"

import { useTranslation } from "react-i18next";


export default function ModuloSelect({ prevModuloId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedModulo, setSelectedModulo] = useState(null);
    const [modulos, setModulos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    {/* Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback */ }
    const manageSelection = useCallback((modulo) => {
        if (onSelect) {
            onSelect(modulo);
        }
    }, [onSelect]);

    // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
    useEffect(() => {
        if (prevModuloId) {
            const modulo = modulos.find((modulo) => modulo.id === prevModuloId);
            if (modulo) {
                setSelectedModulo(modulo);
            }
        } else {
            setSelectedModulo(null);
        }
    }, [prevModuloId, modulos]);

    {/* Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte. */ }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                console.log('response >>', response)
                if (response.status === 200) {
                    setModulos(response.data.modules);
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUrl]);

    {/* useMemo genera la lista de modulos(modulosList), si empleado no cambia, no hace recálculos*/ }
    const modulosList = useMemo(() => {
        return modulos ? modulos.map((modulo) => (
            <CommandItem
                key={modulo.id}
                value={modulo.id.toString()} // Asegúrate de que el valor sea una cadena
                onSelect={() => {
                    setSelectedModulo(modulo);
                    setOpen(false);
                    manageSelection(modulo);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedModulo?.id === modulo.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {modulo.name}
            </CommandItem>
        )) : [];
    }, [modulos, selectedModulo, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedModulo ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedModulo.name}
                        </div>
                    ) : (
                        t('Selecciona Módulo')
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar modulo..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar las modulos.</span>
                                : 'Ninguna modulo encontrada'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {modulosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}