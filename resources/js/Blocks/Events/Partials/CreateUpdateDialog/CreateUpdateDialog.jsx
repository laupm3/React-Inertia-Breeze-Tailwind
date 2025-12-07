import {
    CustomDialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/Components/OwnUi/CustomDialog";
import { Button } from "@/Components/App/Buttons/Button";
import TextInput from "@/Components/OwnUi/TextInput";
import { Editor } from "@/Components/App/Notifications/Yoopta";
import SwitcherEventType from "@/Blocks/Events/Partials/CreateUpdateDialog/SwitcherEventType";
import UserAdvanceMultiselect from "@/Components/App/User/AdvanceMultiselect/AdvanceMultiselect";
import Icon from "@/imports/LucideIcon";
import { useState, useEffect, useRef } from "react";
import { formatDateDMY } from "@/utils";
import { usePage } from "@inertiajs/react";

function CreateUpdateDialog({
    isOpen,
    onClose,
    onSubmit,
    selectedDate,
    eventTypes,
    selectedEvent,
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [description, setDescription] = useState({});
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [formInitialized, setFormInitialized] = useState(false);
    const selectionRef = useRef(null);

    // Función para filtrar al usuario actual de la lista
    const filterCurrentUser = (data) => {
        // Si data es un array directamente (sin propiedad users)
        if (Array.isArray(data)) {
            return data.filter(user => user.id !== currentUser?.id);
        }
        
        // Si data es un objeto con propiedad users
        if (data && data.users && Array.isArray(data.users)) {
            return {
                ...data,
                users: data.users.filter(user => user.id !== currentUser?.id)
            };
        }
        
        return data;
    };

    // Asegúrate de que el body no tenga pointer-events: none cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            // Fuerza el body a no tener pointer-events: none
            document.body.style.pointerEvents = "auto";
        }

        return () => {
            document.body.style.pointerEvents = "auto";
        };
    }, [isOpen]);

    // Funcion parseDescription
    // Esta función se encarga de parsear la descripción del evento y devolverla en el formato correcto.
    const parseDescription = (descriptionData) => {
        // Si es un objeto, no hacer nada
        if (typeof descriptionData === 'object' && descriptionData !== null) {
            return descriptionData;
        }

        // Si no hay datos o es una cadena vacía, devolver un objeto vacío válido para el editor
        if (!descriptionData || descriptionData === '') {
            return {};
        }

        // Si es una cadena, intenta parsear como JSON
        if (typeof descriptionData === 'string') {
            try {
                const parsedObj = JSON.parse(descriptionData);
                return parsedObj;
            } catch (e) {
                console.error('Error parsing description JSON:', e);

                const randomId = Math.random().toString(36).substring(2, 15);
                const defaultValue = {
                    [randomId]: {
                        id: randomId,
                        type: "Paragraph",
                        value: [
                            {
                                id: Math.random().toString(36).substring(2, 15),
                                type: "paragraph",
                                children: [
                                    { text: descriptionData }
                                ]
                            }
                        ],
                        meta: {
                            align: "left",
                            depth: 0,
                            order: 0
                        }
                    }
                };
                return defaultValue;
            }
        }
        return {};
    };

    // Efecto para inicializar o resetear el formulario cuando se abre o cierra
    useEffect(() => {
        if (isOpen) {
            if (selectedEvent) {
                // Rellenar formulario con datos del evento existente
                setTitle(selectedEvent.nombre || selectedEvent.titulo || "");

                // Usar directamente la hora almacenada si está disponible
                if (selectedEvent.hora_inicio) {
                    setTime(selectedEvent.hora_inicio);
                } else if (selectedEvent.fecha_inicio) {
                    const dateTimeParts = selectedEvent.fecha_inicio.split(' ');
                    if (dateTimeParts.length > 1) {
                        setTime(dateTimeParts[1]);
                    }
                }

                setSelectedEventType(selectedEvent.tipo_evento?.id || selectedEvent.tipo_evento_id || null);

                // Parsear la descripción del evento usando la función mejorada
                const parsedDescription = parseDescription(selectedEvent.descripcion);
                setDescription(parsedDescription);

                setSelectedUsers(selectedEvent.users || []);

                if (selectedEvent.entity) {
                    setSelectedEntity(selectedEvent.entity);
                } else {
                    setSelectedEntity(null);
                }
            } else if (!formInitialized) {
                // Solo resetear el formulario si es la primera vez que se abre
                setTitle("");
                setTime("");
                setSelectedEventType(null);
                setSelectedEntity(null);
                setDescription({});
                setSelectedUsers([]);
            }

            setFormInitialized(true);
        }

        // Resetear el formulario cuando se cierra el diálogo
        return () => {
            if (!isOpen) {
                setTitle("");
                setTime("");
                setSelectedEventType(null);
                setSelectedEntity(null);
                setDescription({});
                setSelectedUsers([]);
                setFormInitialized(false);
            }
        };
    }, [isOpen, selectedEvent ? JSON.stringify(selectedEvent) : null]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const entityType = getEntityType(selectedEventType, eventTypes);

        const formatDateWithoutTimezone = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formData = {
            id: selectedEvent?.id,
            titulo: title,
            descripcion: typeof description === 'object' ? JSON.stringify(description) : description,
            fecha_inicio: formatDateWithoutTimezone(selectedDate),
            hora_inicio: time,
            tipo_evento_id: selectedEventType,
            users: selectedUsers,
            entity: selectedEntity,
        };

        if (selectedEntity && entityType) {
            switch (entityType) {
                case 'team':
                    formData.team_id = selectedEntity.id;
                    break;
                case 'empresa':
                    formData.empresa_id = selectedEntity.id;
                    break;
                case 'departamento':
                    formData.departamento_id = selectedEntity.id;
                    break;
            }
        }

        onSubmit(formData);
    };

    const getEntityType = (typeId, types) => {
        if (!typeId) return null;

        const eventType = types.find((type) => type.id === typeId);
        if (!eventType) return null;

        switch (eventType.nombre) {
            case "Equipo":
                return "team";
            case "Empresa":
                return "empresa";
            case "Departamento":
                return "departamento";
            default:
                return null;
        }
    };

    //  Utilidad centralizada para formateo de fechas

    const handleCloseDialog = (open) => {
        if (!open) {
            onClose(open);
        }
    };

    const handleUsersSelected = (userIds) => {
        // userIds es un array de IDs de usuarios seleccionados
        // Convertimos a formato que espera el backend
        setSelectedUsers(userIds || []);
    };

    const handleEditorChange = (newValue) => {
        setDescription(newValue);
    };

    return (
        <CustomDialog
            open={isOpen}
            onOpenChange={handleCloseDialog}
            title={selectedEvent ? "Editar Evento" : "Nuevo Evento"}
            eventDate={formatDateDMY(selectedDate)}
        >
            <DialogContent className="bg-custom-white dark:bg-custom-blackLight text-custom-blackLight dark:text-custom-white w-full h-[80vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Header - Campos principales */}
                    <div className="flex-shrink-0 space-y-2 my-4">
                        <div className="flex gap-3 justify-between items-center">
                            <div className="flex-1">
                                <TextInput
                                    id="titulo"
                                    name="titulo"
                                    className="w-full text-custom-blackLight dark:text-custom-white rounded-full bg-custom-gray-default dark:bg-custom-blackSemi text-sm px-4 py-2 h-10 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-none transition-colors hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium"
                                    placeholder="Título del evento"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex flex-row bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium rounded-full items-center justify-center h-10">
                                <Icon name="Clock" className="w-6 h-6 ml-2 text-custom-orange" />
                                <TextInput
                                    id="hora_inicio"
                                    name="hora_inicio"
                                    type="time"
                                    className="w-full rounded-full bg-transparent dark:bg-transparent text-sm px-3 text-center focus:outline-none focus:ring-2 focus:ring-none transition-colors[&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <SwitcherEventType
                            selectedEventType={selectedEventType}
                            setSelectedEventType={setSelectedEventType}
                            eventTypes={eventTypes}
                            onEntitySelect={setSelectedEntity}
                            initialEntity={selectedEntity}
                        />
                    </div>

                    {/* Content - Editor*/}
                    <div className="flex-1 min-h-0 mb-4">
                        <div className="h-full overflow-y-auto scrollbar-styled bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl">
                            <Editor
                                key={selectedEvent ? selectedEvent.id : 'newEvent'}
                                placeholder="Escribe la descripción del evento..."
                                value={description}
                                onChange={handleEditorChange}
                                selectionBoxRoot={selectionRef}
                            />
                        </div>
                    </div>

                    {/* Footer - Selector y botón */}
                    <div className="flex-shrink-0 space-y-3">
                        <div className="flex flex-row items-center gap-5">
                            {/* <Icon name="Users" className="w-6 h-6 text-custom-orange" /> */}
                            <h2 className="text-lg text-custom-orange font-bold whitespace-nowrap">Compartir con...</h2>
                            <UserAdvanceMultiselect
                                onChangeValue={handleUsersSelected}
                                defaultValue={
                                    selectedUsers.length > 0
                                        ? selectedUsers.map(user => user.id)
                                        : selectedEvent
                                            ? (selectedEvent.users || []).map(user => user.id)
                                            : []
                                }
                                placeholder="Seleccionar participantes del evento"
                                transformData={filterCurrentUser}
                                key={`user-multiselect-${currentUser?.id}`} // Force re-render when user changes
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full"
                                variant="primary"
                                type="submit"
                            >
                                {selectedEvent
                                    ? "Actualizar Evento"
                                    : "Crear Evento"}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </CustomDialog>
    );
}

export default CreateUpdateDialog;
