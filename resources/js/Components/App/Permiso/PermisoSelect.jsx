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
import axios from "axios";
import Pill from "@/Components/App/Pills/Pill"; 
import STATUS_TIPO_PERMISO_COLOR_MAP from "@/Components/App/Pills/constants/StatusTipoPermisoMapColor"; 

export default function PermisoSelect({ prevPermisoId, fetchUrl, className, onSelect }) {
    const [open, setOpen] = useState(false);
    const [selectedPermiso, setSelectedPermiso] = useState(null);
    const [permisos, setPermisos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback
    const manageSelection = useCallback((permiso) => {
        if (onSelect) {
            onSelect(permiso);
        }
    }, [onSelect]);

    // Actualiza el permiso seleccionado si prevPermisoId cambia o los permisos se cargan
    useEffect(() => {
        if (prevPermisoId && permisos.length > 0) {
            const permisoEncontrado = permisos.find((p) => p.id === prevPermisoId);
            if (permisoEncontrado) {
                
                setSelectedPermiso(permisoEncontrado);
            } else {
                // Si no se encuentra el permiso, se establece a null
                setSelectedPermiso(null);
            }
        } else if (!prevPermisoId) {
            // Si no hay prevPermisoId (ej. creando nuevo, o limpiado desde el padre), se establece a null.
            setSelectedPermiso(null);
        }
        // Si prevPermisoId existe pero permisos.length es 0, este bloque no hace nada,
        // esperando a que 'permisos' se cargue y el efecto se redispare.
    }, [prevPermisoId, permisos]);

    // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
    useEffect(() => {
        const fetchData = async () => {
            if (!fetchUrl) {
                setError(new Error("La propiedad fetchUrl es requerida."));
                setLoading(false);
                setPermisos([]); 
                return;
            }
            setLoading(true);
            setError(null); 
            try {
                // Obtener el token CSRF primero para autenticación
                await axios.get('/sanctum/csrf-cookie');
                
                const response = await axios.get(fetchUrl);
                if (response.status === 200) {
                    setPermisos(response.data.permisos || response.data || []);
                } else {
                    setError(new Error(`Error al obtener permisos: ${response.status}`));
                    setPermisos([]);
                }
            } catch (err) {
                setError(err);
                setPermisos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUrl]);

    // useMemo genera la lista de empleados(empleadosList), si empleado no cambia, no hace recálculos
    const permisosList = useMemo(() => {
        return permisos.map((permiso) => (
            <CommandItem
                key={permiso.id}
                value={permiso.id.toString()} 
                onSelect={() => {
                    const currentSelected = permiso.id === selectedPermiso?.id ? null : permiso;
                    setSelectedPermiso(currentSelected);
                    setOpen(false);
                    // Llamar al callback con el permiso seleccionado
                    if (onSelect) {
                        onSelect(currentSelected);
                    }
                }}
                className="cursor-pointer"
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedPermiso?.id === permiso.id ? "opacity-100" : "opacity-0"
                    )}
                />
                <Pill
                    identifier={permiso.nombre}
                    mapColor={STATUS_TIPO_PERMISO_COLOR_MAP}
                    size="sm"
                >
                    {permiso.nombre}
                </Pill>
            </CommandItem>
        ));
    }, [permisos, selectedPermiso, manageSelection]);

    const defaultTriggerClass = "w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semiDark dark:text-custom-gray-semiLight text-sm flex p-2.5 items-center cursor-default";

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    type="button" 
                    role="combobox"
                    aria-expanded={open}
                    className={cn(defaultTriggerClass, className)} 
                    onClick={() => setOpen(!open)}
                    disabled={loading || !!error} 
                >
                    {selectedPermiso ? (
                        <Pill
                            identifier={selectedPermiso.nombre}
                            mapColor={STATUS_TIPO_PERMISO_COLOR_MAP}
                            size="xs"
                            className="ml-0.5 -m-1.5"
                        >
                            {selectedPermiso.nombre || selectedPermiso.descripcion || `Permiso ID: ${selectedPermiso.id}`}
                        </Pill>
                    ) : (
                        "Elige un tipo de permiso"
                    )}
                    <Icon name="ChevronDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput 
                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" 
                        placeholder="Buscar permiso..." />
                    <CommandList>
                        <CommandEmpty>
                            {loading && "Cargando permisos..."}
                            {!loading && error && <span className="text-red-500">{error.message || "Error al cargar los permisos."}</span>}
                            {!loading && !error && permisos.length === 0 && "Ningún permiso encontrado"}
                        </CommandEmpty>
                        <CommandGroup>
                            {permisosList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
