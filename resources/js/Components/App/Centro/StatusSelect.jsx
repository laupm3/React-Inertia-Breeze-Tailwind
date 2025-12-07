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

export default function StatusSelect({ prevStatusId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [estadoCentros, setEstadoCentros] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
    const manageSelection = useCallback((estado) => {
        if (onSelect) {
            onSelect(estado);
        }
    }, [onSelect]);

    // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
    useEffect(() => {
        if (prevStatusId) {
            const estadoCentro = estadoCentros.find((estadoCentro) => estadoCentro.id === prevStatusId);
            if (estadoCentro) {
                setSelectedEstado(estadoCentro);
            }
        } else {
            setSelectedEstado(null);
        }
    }, [prevStatusId, estadoCentros]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setEstadoCentros(response.data.estadoCentros);
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

    // useMemo genera la lista de estados(estadosList), si empleado no cambia, no hace recálculos
    const estadosList = useMemo(() => {
        return estadoCentros.map((estado) => (
            <CommandItem
                key={estado.id}
                value={estado.id}
                onSelect={() => {
                    setSelectedEstado(estado);
                    setOpen(false);
                    manageSelection(estado);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedEstado?.id === estado.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {estado.nombre}
            </CommandItem>
        ));
    }, [estadoCentros, selectedEstado, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-gray-600 ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedEstado ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedEstado.nombre}
                        </div>
                    ) : (
                        t('placeholder.SeleccionaEstado')
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar estado..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar los estados.</span>
                                : 'Ningún estado encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {estadosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}