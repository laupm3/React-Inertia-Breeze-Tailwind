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

import { useTranslation } from "react-i18next";

export default function ParentDepartamentoSelect({ prevParentDepartamentoId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedDepartamento, setSelectedDepartamento] = useState(null);
    const [parentDepartments, setParentDepartments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    const manageSelection = (parentDepartment) => {
        if (onSelect) {
            onSelect(parentDepartment);
        }
    }

    useEffect(() => {
        if (prevParentDepartamentoId) {
            const parentDepartment = parentDepartments.find((parentDepartment) => parentDepartment.id === prevParentDepartamentoId);
            if (parentDepartment) {
                setSelectedDepartamento(parentDepartment);
            }
        } else {
            setSelectedDepartamento(null);
        }
    }, [prevParentDepartamentoId, parentDepartments])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setParentDepartments(response.data.departamentos);
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
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-gray-600 ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedDepartamento ? (
                        <div className="flex items-center ml-4 -m-1.5">
                            {selectedDepartamento.nombre}
                        </div>
                    ) : (
                        'Seleccione un departamento padre...'
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar departamento padre..." />
                    <CommandList>
                        <CommandEmpty>
                            {!error
                                ? <span className="text-red-500">Error al cargar los departamentos.</span>
                                : 'Ningún departamento encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {loading ? (
                                <div className="p-2 text-center">Cargando departamentos...</div>
                            ) : parentDepartments && parentDepartments.length > 0 ? (
                                parentDepartments.map((parentDepartment) => (
                                    <CommandItem
                                        key={parentDepartment.id}
                                        value={parentDepartment.id}
                                        onSelect={() => {
                                            setSelectedDepartamento(parentDepartment);
                                            setOpen(false);
                                            manageSelection(parentDepartment);
                                        }}
                                    >
                                        <Icon name="Check"
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedDepartamento?.id === parentDepartment.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {parentDepartment.nombre}
                                    </CommandItem>
                                ))
                            ) : (
                                <div className="p-2 text-center">No hay departamentos disponibles</div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
