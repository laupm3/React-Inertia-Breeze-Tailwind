import { useState, useEffect, useMemo, useCallback } from "react";
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
import axios from "axios";

/**
 * Componente de selección de usuario con búsqueda y filtrado
 * Permite seleccionar usuarios sin empleado asociado y mantiene visible el usuario original
 * 
 * @component
 * @example
 * ```jsx
 * <UserSelect
 *   disabled={false}
 *   onSelect={(user) => console.log(user)}
 *   selectedUserId={1}
 *   clearable={true}
 * />
 * ```
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} [props.disabled=false] - Si el selector está deshabilitado
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {Function} props.onSelect - Callback que se ejecuta cuando se selecciona un usuario
 * @param {number|null} [props.selectedUserId=null] - ID del usuario actualmente seleccionado
 * @param {boolean} [props.clearable=false] - Si el usuario puede ser deseleccionado
 */
export default function UserSelect({ 
    disabled = false,
    className, 
    onSelect,
    selectedUserId = null,
    clearable = false
}) {
    /**
     * Estados del componente
     * @type {[boolean, Function]} open - Estado de apertura del popover
     * @type {[Object|null, Function]} selectedUser - Usuario seleccionado actualmente
     * @type {[Array, Function]} users - Lista de usuarios disponibles
     * @type {[Object|null, Function]} originalUser - Usuario original asociado al empleado
     * @type {[string|null, Function]} error - Mensaje de error si existe
     * @type {[boolean, Function]} loading - Estado de carga de datos
     */
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [originalUser, setOriginalUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Hook de traducción para internacionalización
     * @type {Object} t - Función de traducción
     */
    const { t } = useTranslation('datatable');

    /**
     * Maneja la selección del usuario y notifica al componente padre
     * 
     * @param {Object|null} user - Usuario seleccionado o null si se deselecciona
     * @returns {void}
     */
    const manageSelection = useCallback((user) => {
        if (onSelect) {
            onSelect(user);
        }
    }, [onSelect]);

    /**
     * Carga los usuarios sin empleado asignado desde la API y el usuario seleccionado si existe
     * Mantiene el usuario original en un estado separado para preservarlo en la lista
     * 
     * @returns {void}
     */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                // Obtener usuarios sin empleado
                const response = await axios.get(
                    route('api.v1.admin.users.relationship.withoutEmployee')
                );
                
                let usersList = response.data.users || [];
                
                // Si hay un selectedUserId y no está en la lista, cargar ese usuario específico
                if (selectedUserId && !usersList.some(user => user.id === selectedUserId)) {
                    try {
                        const userResponse = await axios.get(
                            route('api.v1.admin.users.show', { id: selectedUserId })
                        );
                        if (userResponse.status === 200 && userResponse.data.user) {
                            // Añadir el usuario seleccionado a la lista si no está ya
                            usersList = [userResponse.data.user, ...usersList];
                            // Guardamos el usuario original para mantenerlo en la lista
                            setOriginalUser(userResponse.data.user);
                        }
                    } catch (userError) {
                        console.error('Error fetching selected user:', userError);
                    }
                }
                
                setUsers(usersList);
            } catch (error) {
                setError(error.message || 'Error al cargar usuarios');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [selectedUserId]);

    /**
     * Actualiza el usuario seleccionado cuando cambia selectedUserId o la lista de usuarios
     * 
     * @returns {void}
     */
    useEffect(() => {
        if (selectedUserId) {
            const user = users.find((user) => user.id === selectedUserId);
            if (user) {
                setSelectedUser(user);
            }
        } else {
            setSelectedUser(null);
        }
    }, [selectedUserId, users]);

    /**
     * Lista de usuarios memorizada para evitar re-renders innecesarios
     * Incluye siempre el usuario original si existe, incluso después de deseleccionarlo
     * 
     * @type {Array<JSX.Element>} Lista de elementos CommandItem para cada usuario
     */
    const usersList = useMemo(() => {
        // Aseguramos que la lista incluya al usuario original si existe
        let displayUsers = [...users];
        
        // Si tenemos un usuario original y no está en la lista, lo añadimos
        if (originalUser && !displayUsers.some(user => user.id === originalUser.id)) {
            displayUsers = [originalUser, ...displayUsers];
        }
        
        return displayUsers.map((user) => (
            <CommandItem
                key={user.id}
                value={`${user.name} ${user.email}`}
                onSelect={() => {
                    if (selectedUser?.id === user.id) {
                        setSelectedUser(null);
                        manageSelection(null);
                    } else {
                        setSelectedUser(user);
                        manageSelection(user);
                    }
                    setOpen(false);
                }}
            >
                <Icon 
                    name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                    )}
                />
                <div className="flex items-center gap-2">
                    <span>{user.name}</span>
                    <span className="text-xs text-gray-500">({user.email})</span>
                </div>
            </CommandItem>
        ));
    }, [users, selectedUser, manageSelection, originalUser]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker",
                        "text-custom-gray-semiDark dark:text-custom-gray-semiLight text-sm flex p-2.5 items-center",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    onClick={() => setOpen(!open)}
                >
                    {selectedUser ? (
                        <div className="flex items-center gap-2 ml-4">
                            <span>{selectedUser.name}</span>
                        </div>
                    ) : (
                        <span className="ml-4">{t('tables.asociarusuario')}</span>
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
                <Command>
                    <CommandInput 
                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" 
                        placeholder="Buscar usuario..." 
                    />
                    <CommandList>
                        <CommandEmpty>
                            {error 
                                ? <span className="text-red-500">{error}</span>
                                : loading 
                                    ? 'Cargando usuarios...'
                                    : 'No hay usuarios disponibles'
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {usersList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 