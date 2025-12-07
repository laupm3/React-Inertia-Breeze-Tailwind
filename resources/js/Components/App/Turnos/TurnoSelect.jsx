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

export default function TurnoSelect({ prevTurnoId, turnosData = [], className, onSelect, disabled = false, placeholder }) {
    const [open, setOpen] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    // Función manageSelection
    // Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback
    const manageSelection = useCallback((turno) => {
        if (onSelect) {
            onSelect(turno);
        }
    }, [onSelect]);

    // Establecer los turnos solo cuando cambien los datos recibidos
    useEffect(() => {
        setTurnos(turnosData || []);
        setLoading(false);
    }, [turnosData]);

    // Actualiza el turno seleccionado, si prevTurnoId cambia
    useEffect(() => {
        if (prevTurnoId && turnos.length > 0) {
            const turno = turnos.find((t) => t.id === prevTurnoId);
            if (turno) {
                setSelectedTurno(turno);
            }
        } else if (!prevTurnoId) {
            setSelectedTurno(null);
        }
    }, [prevTurnoId, turnos]);

    // Función useMemo turnosList
    // useMemo genera la lista de turno(turnoList), si turno no cambia, no hace recálculos
    const turnosList = useMemo(() => {
        return turnos.map((turno, index) => (
            <CommandItem
                key={turno.id ? `turno-${turno.id}` : `turno-index-${index}`}
                value={turno.id?.toString()}
                onSelect={() => {
                    (turno.id === selectedTurno?.id)
                        ? setSelectedTurno(null)
                        : setSelectedTurno(turno);
                    setOpen(false);
                    manageSelection((turno.id !== selectedTurno?.id) ? turno : null);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedTurno?.id === turno.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {turno.nombre || turno.name || 'Sin nombre'} - {turno.centro?.nombre}
            </CommandItem>
        ));
    }, [turnos, selectedTurno, manageSelection]);

    return (
        <Popover open={open} onOpenChange={disabled ? () => { } : setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'} text-sm flex p-2.5 items-center`}
                    onClick={disabled ? () => { } : () => setOpen(!open)}
                    disabled={disabled}
                >
                    {selectedTurno ? (
                        <div className="flex items-center ml-4">
                            <span>{selectedTurno.nombre || selectedTurno.name || 'Sin nombre'} - {selectedTurno.centro?.nombre}</span>
                        </div>
                    ) : (
                        <span className="ml-4">{placeholder || t('placeholder.SeleccionaTurno')}</span>
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2 bg-custom-gray-default dark:bg-custom-blackSemi">
                <Command className='bg-custom-gray-default dark:bg-custom-blackSemi'>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar turno..." />
                    <CommandList className='dark:dark-scrollbar'>
                        <CommandEmpty>
                            {loading
                                ? <span>Cargando turnos...</span>
                                : <span>Ningún turno encontrado</span>
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {!loading && turnosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
