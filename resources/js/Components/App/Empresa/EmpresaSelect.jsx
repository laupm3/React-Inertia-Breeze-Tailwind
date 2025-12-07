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

export default function EmpresaSelect({ prevEmpresaId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    {/* Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback */ }
    const manageSelection = useCallback((empresa) => {
        if (onSelect) {
            onSelect(empresa);
        }
    }, [onSelect]);

    // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
    useEffect(() => {
        if (prevEmpresaId) {
            const empresa = empresas.find((empresa) => empresa.id === prevEmpresaId);
            if (empresa) {
                setSelectedEmpresa(empresa);
            }
        } else {
            setSelectedEmpresa(null);
        }
    }, [prevEmpresaId, empresas]);

    {/* Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte. */ }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setEmpresas(response.data.empresas);
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

    {/* useMemo genera la lista de empresas(empresasList), si empleado no cambia, no hace recálculos*/ }
    const empresasList = useMemo(() => {
        return empresas.map((empresa) => (
            <CommandItem
                key={empresa.id}
                value={empresa.id}
                onSelect={() => {
                    setSelectedEmpresa(empresa);
                    setOpen(false);
                    manageSelection(empresa);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmpresa?.id === empresa.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {empresa.nombre}
            </CommandItem>
        ));
    }, [empresas, selectedEmpresa, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedEmpresa ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedEmpresa.nombre}
                        </div>
                    ) : (
                        'Selecciona empresa'
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar empresa..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar las empresas.</span>
                                : 'Ninguna empresa encontrada'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {empresasList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}