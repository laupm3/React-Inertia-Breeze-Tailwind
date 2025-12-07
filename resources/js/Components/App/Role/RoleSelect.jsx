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

export default function RoleSelect({ prevRoleId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
    const manageSelection = useCallback((role) => {
        if (onSelect) {
            onSelect(role);
        }
    }, [onSelect]);

    // Actualiza el rol seleccionado, si prevRoleId cambia
    useEffect(() => {
        if (prevRoleId) {
            const role = roles.find((role) => role.id === prevRoleId);
            if (role) {
                setSelectedRole(role);
            }
        } else {
            setSelectedRole(null);
        }
    }, [prevRoleId, roles]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setRoles(response.data.roles);
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

    // useMemo genera la lista de roles, si el rol no cambia, no hace recálculos
    const rolesList = useMemo(() => {
        return roles.map((role) => (
            <CommandItem
                key={role.id}
                value={role.id}
                onSelect={() => {
                    setSelectedRole(role);
                    setOpen(false);
                    manageSelection(role);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedRole?.id === role.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {role.name}
            </CommandItem>
        ));
    }, [roles, selectedRole, manageSelection]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semiDark dark:text-custom-gray-semiLight ${className} text-sm flex p-2.5 items-center cursor-default`}
                    onClick={() => setOpen(!open)}
                >
                    {selectedRole ? (
                        <div className="flex items-center ml-4">
                            <span>{selectedRole.name}</span>
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
                                ? <span className="text-red-500">Error al cargar los roles.</span>
                                : 'Ningún rol encontrado'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {rolesList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}