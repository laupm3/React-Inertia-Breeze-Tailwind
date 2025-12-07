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
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function EmpleadoSelect({ prevEmpleadoId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    // Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback
    const manageSelection = useCallback((empleado) => {
        if (onSelect) {
            onSelect(empleado);
        }
    }, [onSelect]);

    // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
    useEffect(() => {
        if (prevEmpleadoId) {
            const empleado = empleados.find((empleado) => empleado.id === prevEmpleadoId);
            if (empleado) {
                setSelectedEmpleado(empleado);
            }
        } else {
            setSelectedEmpleado(null);
        }
    }, [prevEmpleadoId, empleados]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setEmpleados(response.data.empleados);
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

    // useMemo genera la lista de empleados(empleadosList), si empleado no cambia, no hace recálculos
    const empleadosList = useMemo(() => {
        return empleados.map((empleado) => (
            <CommandItem
                key={empleado.id}
                value={empleado.id}
                onSelect={() => {
                    (empleado.id === selectedEmpleado?.id)
                        ? setSelectedEmpleado(null)
                        : setSelectedEmpleado(empleado);
                    setOpen(false);
                    manageSelection(empleado);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmpleado?.id === empleado.id ? "opacity-100" : "opacity-0"
                    )}
                />
                <EmpleadoAvatar empleado={empleado} />
            </CommandItem>
        ));
    }, [empleados, selectedEmpleado, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semiDark dark:text-custom-gray-semiLight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedEmpleado ? (
                        <div className="flex w-96 items-center ml-4 -m-1.5">
                            <EmpleadoAvatar empleado={selectedEmpleado} />
                        </div>
                    ) : (
                        t('placeholder.SeleccionaEmpleado')
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar empleado..." />
                    <CommandList>
                        <CommandEmpty>
                            {error
                                ? <span className="text-red-500">Error al cargar los empleados.</span>
                                : 'Ningún empleado encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {empleadosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}