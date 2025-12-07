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


export default function ContratoSelect({ prevContratoId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedContrato, setSelectedContrato] = useState(null);
    const [contratos, setContratos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    {/* Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback */ }
    const manageSelection = useCallback((contrato) => {
        if (onSelect) {
            onSelect(contrato);
        }
    }, [onSelect]);

    // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
    useEffect(() => {
        if (prevContratoId) {
            const contrato = contratos.find((contrato) => contrato.id === prevContratoId);
            if (contrato) {
                setSelectedContrato(contrato);
            }
        } else {
            setSelectedContrato(null);
        }
    }, [prevContratoId, contratos]);

    {/* Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte. */ }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setContratos(response.data.tipos);
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

    {/* useMemo genera la lista de contratos(contratosList), si empleado no cambia, no hace recálculos*/ }
    const contratosList = useMemo(() => {
        return contratos ? contratos.map((contrato) => (
            <CommandItem
                key={contrato.id}
                value={contrato.id.toString()} // Asegúrate de que el valor sea una cadena
                onSelect={() => {
                    setSelectedContrato(contrato);
                    setOpen(false);
                    manageSelection(contrato);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedContrato?.id === contrato.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {contrato.nombre}
            </CommandItem>
        )) : [];
    }, [contratos, selectedContrato, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedContrato ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedContrato.nombre}
                        </div>
                    ) : (
                        t('placeholder.SeleccionaContrato')
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar contrato..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar las contratos.</span>
                                : 'Ninguna contrato encontrada'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {contratosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}