import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/App/Buttons/Button";
import Checkbox from "@/Components/Checkbox";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react"; 

import Icon from "@/imports/LucideIcon";

function UserEventSelector({ 
    onUsersSelected, 
    initialSelectedUsers = [], 
    isNewEvent = false,
    preserveSelection = false 
}) {
    // Obtenemos el usuario actual
    const { auth } = usePage().props;
    const currentUser = auth?.user || {};

    //States - Variables de estado
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Almacenar todos los usuarios
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [errorUsers, setErrorUsers] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const initialRender = useRef(true);
    const initialSelectedRef = useRef([]); // Referencia para comparar los usuarios iniciales

    // Optimizado: carga todos los usuarios una sola vez
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            setErrorUsers(null);
            try {
                const response = await axios.get(route('api.v1.admin.users.index'));
                // Filtramos al usuario actual de la lista
                const filteredUsers = (response.data.users || []).filter(
                    user => user.id !== currentUser.id
                );
                setAllUsers(filteredUsers);
                
                // Solo sincronizamos los usuarios iniciales si han cambiado o es la primera carga
                if (initialRender.current) {
                    synchronizeInitialUsers(filteredUsers);
                    initialRender.current = false;
                }
            } catch (error) {
                setErrorUsers("Error al cargar usuarios");
                console.error("Error al obtener usuarios:", error);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [currentUser.id]); // Solo depende del usuario actual, no de initialSelectedUsers

    // Función para sincronizar los usuarios iniciales con datos completos
    const synchronizeInitialUsers = (allUsersList) => {
        if (!initialSelectedUsers || initialSelectedUsers.length === 0) {
            setSelectedUsers([]);
            initialSelectedRef.current = [];
            return;
        }
        
        // Solo procesamos si los usuarios iniciales han cambiado
        if (!areUserArraysEqual(initialSelectedUsers, initialSelectedRef.current)) {
            const completeInitialUsers = initialSelectedUsers.map(initialUser => {
                // Buscar el usuario completo con todos sus datos en allUsers
                const completeUser = allUsersList.find(u => u.id === initialUser.id);
                // Si lo encontramos, devolvemos el usuario completo, sino el original
                return completeUser || initialUser;
            });
            setSelectedUsers(completeInitialUsers);
            initialSelectedRef.current = [...initialSelectedUsers];
        }
    };

    // Comprueba si dos arrays de usuarios son iguales (por IDs)
    const areUserArraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        const ids1 = new Set(arr1.map(u => u.id));
        return arr2.every(u => ids1.has(u.id));
    };

    // Efecto para manejar cambios en initialSelectedUsers, pero de manera controlada
    useEffect(() => {
        // Solo procesamos si hay usuarios cargados y los initialSelectedUsers han cambiado
        if (allUsers.length > 0 && !areUserArraysEqual(initialSelectedUsers, initialSelectedRef.current)) {
            synchronizeInitialUsers(allUsers);
        }
    }, [initialSelectedUsers]);

    // Notificar a los padres cuando se seleccionan usuarios, pero solo cuando realmente cambian
    useEffect(() => {
        if (onUsersSelected && !initialRender.current) {
            onUsersSelected(selectedUsers);
        }
    }, [selectedUsers, onUsersSelected]);

    // Reinicia el término de búsqueda solo cuando cambian los usuarios iniciales
    useEffect(() => {
        if (!areUserArraysEqual(initialSelectedUsers, initialSelectedRef.current)) {
            setSearchTerm("");
        }
    }, [initialSelectedUsers]);

    // Filtrado optimizado en memoria
    const filteredUsers = useMemo(() => {
        if (searchTerm.length === 0) return allUsers;
        return allUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    //Funcion handleSelectAll
    //Selecciona todos los usuarios
    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers);
        }
    };

    //Funcion handleUserSelect
    // Selecciona un usuario
    const handleUserSelect = (user) => {
        setSelectedUsers(prev => {
            if (prev.some(u => u.id === user.id)) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    // Funcion toggleUserSelection
    // Selecciona o deselecciona un usuario
    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            if (prev.some(u => u.id === user.id)) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

     /**
     * renderUserItem - "Parecido a una Datatable"
     * Recibe un usuario y devuelve un componente con la información del usuario
     * 
     * @param {Object} usuario - Avatar del usuario seleccionado que se renderiza
     * @returns {JSX.Element} - Componente con la información del evento
     */

    const renderUserItem = (user) => (
        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-custom-gray-light dark:hover:bg-custom-blackLight rounded-lg">
            <div className="flex items-center">
                <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onCheckedChange={() => handleUserSelect(user)}
                    className="mr-2"
                />
                <div className="flex items-center">
                    {user.profile_photo_url ? (
                        <img
                            src={user.profile_photo_url}
                            alt={user.name}
                            className="h-6 w-6 rounded-full mr-2 object-cover"
                        />
                    ) : (
                        <div className="h-6 w-6 rounded-full mr-2 bg-[#ebf4ff] flex items-center justify-center">
                            <span className="text-xs text-blue-500">
                                {user.name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('')}
                            </span>
                        </div>
                    )}
                    <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                        {user.name}
                    </label>
                </div>
            </div>
        </div>
    );
    
     /**
     * renderSelectedAvatars
     * Recibe un usuario y devuelve un componente con el avatar del usuario seleccionado
     * 
     * @param {Object} usuario - Avatar del usuario seleccionado que se renderiza
     * @returns {JSX.Element} - Componente con la información del evento
     */
    
     const renderSelectedAvatars = () => (
        <div className="flex -space-x-4 mt-2">
            {selectedUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="relative group">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-custom-blackLight bg-custom-gray-light relative z-10 overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleUserSelection(user);
                        }}
                    >
                        {user.profile_photo_url ? (
                            <img
                                className="w-full h-full object-cover"
                                src={user.profile_photo_url}
                                alt={user.name}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-[#ebf4ff]">
                                <span className="text-blue-500">
                                    {user.name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-custom-blackLight dark:bg-custom-gray-default text-white dark:text-custom-blackLight text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 min-w-max">
                        {user.name}
                    </div>
                </div>
            ))}
            {selectedUsers.length > 10 && (
                <div className="relative group">
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-custom-blackLight bg-custom-orange relative z-10 overflow-hidden cursor-pointer flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                            +{selectedUsers.length - 10}
                        </span>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-custom-blackLight dark:bg-custom-gray-default text-white dark:text-custom-blackLight text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                        {selectedUsers.length - 10} usuarios más
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col mt-3">
            <div className="flex items-center justify-between w-full">
                <p className="text-md text-custom-orange w-1/3">
                    <strong>Compartir con...</strong>
                </p>

                <div className="relative w-2/3 flex items-center">
                    <div className="relative flex-1">
                        <Icon
                            name="Search"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                        />
                        <Input
                            type="text"
                            placeholder="Buscar empleado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-custom-gray-default border-none rounded-full dark:bg-custom-blackSemi pl-10 w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center mb-2 px-2">
                <Checkbox
                    id="selectAll"
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onCheckedChange={handleSelectAll}
                    className="mr-2"
                />
                <label htmlFor="selectAll" className="text-sm cursor-pointer">
                    Seleccionar todos
                </label>
            </div>

            {loadingUsers ? (
                <div className="flex justify-center items-center h-40">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-custom-orange border-t-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
            ) : errorUsers ? (
                <div className="text-red-500 text-center py-4">
                    Error al cargar usuarios
                </div>
            ) : (
                <>
                    <div className="w-full h-40 overflow-y-auto no-scrollbar p-2">
                        {filteredUsers
                            .slice((currentPage - 1) * 10, currentPage * 10)
                            .map(renderUserItem)}
                    </div>
                    <div>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {filteredUsers.length > 0
                                    ? `Mostrando ${(currentPage - 1) * 10 + 1} a ${Math.min(
                                        currentPage * 10,
                                        filteredUsers.length
                                    )} de ${filteredUsers.length} usuarios`
                                    : "No hay usuarios para mostrar"}
                            </div>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-xl bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <Icon name="ChevronLeft" className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                            </Button>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Página {currentPage} de {Math.ceil(filteredUsers.length / 10)}</span>
                            </div>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-xl bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredUsers.length / 10)))}
                                disabled={currentPage >= Math.ceil(filteredUsers.length / 10)}
                            >
                                <Icon name="ChevronRight" className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {selectedUsers.length > 0 && (
                <div>
                    <Label className="text-custom-blue dark:text-custom-white font-bold">
                        Seleccionados: {selectedUsers.length}
                    </Label>
                    {renderSelectedAvatars()}
                </div>
            )}
        </div>
    );
}

export default UserEventSelector;