import { useEffect, useState } from "react"

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

export default function CentroSelect({ prevCentroId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);
    const [centros, setCentros] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

//funcion para manejar la seleccion de un centro
    const manageSelection = (centro) => {
        if (onSelect) {
            onSelect(centro);
        }
    }
    useEffect(() => {
        if (prevCentroId) {

            const centro = centros.find((centro) => centro.id === prevCentroId);
            if (centro) {
                setSelectedCentro(centro);
            }
        } else {
            setSelectedCentro(null);
        }
    }, [prevCentroId, centros])
    
//funcion para obtener los centros
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setCentros(response.data.centros);
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
        return () => { };
    }, [fetchUrl]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedCentro ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedCentro.nombre} {(selectedCentro.empresa?.siglas) ? `- ${selectedCentro.empresa.siglas}` : ''}
                        </div>
                    ) : (
                        'Seleccione un centro...'
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-dark bg-custom-gray-default dark:bg-custom-blackSemi" placeholder="Buscar centro..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar los centros.</span>
                                : 'Ningún centro encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {centros.map((centro) => (
                                <CommandItem
                                    key={centro.id}
                                    value={centro.id}
                                    onSelect={() => {
                                        setSelectedCentro(centro);
                                        setOpen(false);
                                        manageSelection(centro);
                                    }}
                                >
                                    <Icon name="Check"
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCentro?.id === centro.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {centro.nombre} {(centro.empresa?.siglas) ? `- ${centro.empresa.siglas}` : ''}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}