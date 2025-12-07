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
import axios from "axios";

export default function JornadaSelect({ prevJornadaId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedJornada, setSelectedJornada] = useState(null);
    const [jornadas, setJornadas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
    const manageSelection = useCallback((jornada) => {
        if (onSelect) {
            onSelect(jornada);
        }
    }, [onSelect]);

    // Actualiza el rol seleccionado, si prevJornadaId cambia
    useEffect(() => {
        if (prevJornadaId) {
            const jornada = jornadas.find((jornada) => jornada.id === prevJornadaId);
            if (jornada) {
                setSelectedJornada(jornada);
            }
        } else {
            setSelectedJornada(null);
        }
    }, [prevJornadaId, jornadas]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setJornadas(response.data.jornadas);
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

    // useMemo genera la lista de jornadas, si el rol no cambia, no hace recálculos
    const jornadasList = useMemo(() => {
        return jornadas.map((jornada) => (
            <CommandItem
                key={jornada.id}
                value={jornada.id}
                onSelect={() => {
                    setSelectedJornada(jornada);
                    setOpen(false);
                    manageSelection(jornada);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedJornada?.id === jornada.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {jornada.name}

                {/* //TODO enlace a SheetTable de Jornadas
                // <div className="flex ml-auto p-2 dark:bg-custom-gray-semiDark rounded-xl">
                    <Icon name="ArrowUpRight" />
                </div> */}
            </CommandItem>
        ));
    }, [jornadas, selectedJornada, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    jornada="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semiDark dark:text-custom-gray-semiLight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedJornada ? (
                        <div className="flex items-center ml-4">
                            <span>{selectedJornada.name}</span>
                        </div>
                    ) : (
                        t('placeholder.SeleccionaRol')
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar rol..." />
                    <CommandList>
                        <CommandEmpty>
                            {error
                                ? <span className="text-red-500">Error al cargar los jornadas.</span>
                                : 'Ningún rol encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {jornadasList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}