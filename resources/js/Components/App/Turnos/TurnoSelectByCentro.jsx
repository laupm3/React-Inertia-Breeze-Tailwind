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

export default function TurnoSelectByCentro({ prevTurnoId, fetchUrl, className, onSelect, centroIdSelected }) {

    const [open, setOpen] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [turnosPorCentro, setTurnosPorCentro] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTurnosPorCentro([...turnos.filter(turno => turno.centro.id === centroIdSelected)]);
    }, [turnos, centroIdSelected]);


    const manageSelection = (turno) => {
        if (onSelect) {
            onSelect(turno);
        }
    }

    useEffect(() => {
        if (prevTurnoId) {
            const turno = turnos.find((turno) => turno.id === prevTurnoId);
            if (turno) {
                setSelectedTurno(turno);
            }
        } else {
            setSelectedTurno(null);
        }
    }, [prevTurnoId, turnos])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setTurnos(response.data.turnos);
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

    if (!centroIdSelected) {
        return (
            <button
                className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                disabled
            >
                Selecciona un centro primero
            </button>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedTurno ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedTurno.nombre} {(selectedTurno.empresa?.siglas) ? `- ${selectedTurno.empresa.siglas}` : ''}
                        </div>
                    ) : (
                        'Seleccione un turno...'
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-dark bg-custom-gray-default dark:bg-custom-blackSemi" placeholder="Buscar turno..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar los turnos.</span>
                                : 'Ningún turno encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {turnosPorCentro.map((turno) => (
                                <CommandItem
                                    key={turno.id}
                                    value={turno.id}
                                    onSelect={() => {
                                        setSelectedTurno(turno);
                                        setOpen(false);
                                        manageSelection(turno);
                                    }}
                                >
                                    <Icon name="Check"
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedTurno?.id === turno.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {turno.nombre} {(turno.empresa?.siglas) ? `- ${turno.empresa.siglas}` : ''}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
