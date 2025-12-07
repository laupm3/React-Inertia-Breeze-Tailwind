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

export default function DepartamentoSelect({ prevDepartamentoId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedDepartamento, setSelectedDepartamento] = useState(null);
    const [departamentos, setDepartamentos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
    const manageSelection = useCallback((departamento) => {
        if (onSelect) {
            onSelect(departamento);
        }
    }, [onSelect]);

    // Actualiza el rol seleccionado, si prevDepartamentoId cambia
    useEffect(() => {
        if (prevDepartamentoId) {
            const departamento = departamentos.find((departamento) => departamento.id === prevDepartamentoId);
            if (departamento) {
                setSelectedDepartamento(departamento);
            }
        } else {
            setSelectedDepartamento(null);
        }
    }, [prevDepartamentoId, departamentos]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setDepartamentos(response.data.departamentos);
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

    // useMemo genera la lista de departamentos, si el rol no cambia, no hace recálculos
    const departamentosList = useMemo(() => {
        return departamentos.map((departamento) => (
            <CommandItem
                key={departamento.id}
                value={departamento.id}
                onSelect={() => {
                    setSelectedDepartamento(departamento);
                    setOpen(false);
                    manageSelection(departamento);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedDepartamento?.id === departamento.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {departamento.nombre}
            </CommandItem>
        ));
    }, [departamentos, selectedDepartamento, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    departamento="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedDepartamento ? (
                        <div className="flex items-center ml-4">
                            <span>{selectedDepartamento.nombre}</span>
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
                                ? <span className="text-red-500">Error al cargar los departamentos.</span>
                                : 'Ningún rol encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {departamentosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}