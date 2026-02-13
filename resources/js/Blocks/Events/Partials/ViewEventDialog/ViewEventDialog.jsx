import {
    CustomDialog,
    DialogContent,
    DialogTitle,
} from "@/Components/OwnUi/CustomDialog";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { useState, useMemo, useEffect } from "react";
import { formatDateDMY, formatDateSpanish } from "@/Utils";
import { Viewer } from "@/Components/App/Notifications/Yoopta";
import axios from "axios";
import DecisionModal from "@/Components/App/Modals/DecisionModal";

function ViewEventDialog({ isOpen, onClose, eventData, onEdit, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [creador, setCreador] = useState(null);
    const [isDestructiveModalOpen, setIsDestructiveModalOpen] = useState(false);

    // Obtener datos completos del creador
    useEffect(() => {
        const fetchCreador = async () => {
            if (eventData?.creador?.id) {
                try {
                    const response = await axios.get(route('api.v1.admin.users.show', {
                        user: eventData.creador.id
                    }));
                    setCreador(response.data.user);
                } catch (error) {
                    console.error("Error al obtener datos del creador:", error);
                    // Si hay error, usamos los datos básicos que ya tenemos
                    setCreador(eventData.creador);
                }
            } else {
                setCreador(eventData?.creador || null);
            }
        };

        if (isOpen && eventData?.creador) {
            fetchCreador();
        }
    }, [eventData, isOpen]);

    // Parse description JSON if it's a string
    const parsedDescription = useMemo(() => {
        if (!eventData?.descripcion) return null;

        // If it's already an object, return it
        if (typeof eventData.descripcion === 'object') {
            return eventData.descripcion;
        }

        // Try to parse it as JSON if it's a string
        try {
            return JSON.parse(eventData.descripcion);
        } catch (error) {
            console.error("Error parsing description JSON:", error);
            // Return a fallback object with the raw text
            return {
                "root": {
                    "children": [
                        {
                            "type": "paragraph",
                            "children": [
                                { "text": eventData.descripcion || "" }
                            ]
                        }
                    ]
                }
            };
        }
    }, [eventData?.descripcion]);

    const handleEdit = () => {
        onClose();
        if (onEdit && eventData) {
            onEdit(eventData);
        }
    };

    const manageDelete = async () => {
        if (!eventData || !eventData.id) return;

        try {
            setIsDeleting(true);
            router.delete(route('user.eventos.destroy', { evento: eventData.id }), {
                onSuccess: () => {
                    onClose();
                    if (onDelete) {
                        onDelete(eventData.id);
                    }
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
                onError: (errors) => {
                    console.error("Error al eliminar el evento:", errors);
                    setIsDeleting(false);
                }
            });
        } catch (error) {
            console.error("Error al procesar la eliminación:", error);
            setIsDeleting(false);
        }
    }

    return (
        <CustomDialog
            open={isOpen}
            onOpenChange={onClose}
            title="Detalles del Evento"
            eventDate={eventData?.fecha_inicio ? formatDateDMY(eventData.fecha_inicio) : undefined}
        >
            <DialogContent className="bg-custom-white dark:bg-custom-blackLight text-custom-blackLight dark:text-custom-white w-full h-[80vh] flex flex-col">
                <div className="flex flex-col h-full">                    {/* Header - Información del evento */}
                    <div className="flex-shrink-0 space-y-3 my-4">
                        {/* Título y tipo de evento */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {eventData?.tipo_evento && (
                                    <span
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: eventData.tipo_evento.color,
                                        }}
                                    ></span>
                                )}
                                <h2 className="text-xl font-semibold text-custom-blackLight dark:text-custom-white truncate">
                                    {eventData?.nombre || eventData?.titulo}
                                </h2>
                            </div>

                            {/* Tipo de evento pill */}
                            {eventData?.tipo_evento && (
                                <div
                                    className="ml-4 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 flex-shrink-0"
                                    style={{
                                        backgroundColor: `${eventData.tipo_evento.color}20`,
                                        borderColor: `transparent`,
                                        color: eventData.tipo_evento.color,
                                    }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{
                                            backgroundColor: eventData.tipo_evento.color,
                                        }}
                                    ></span>
                                    {eventData.tipo_evento.nombre}
                                </div>
                            )}
                        </div>

                        {/* Información del evento y botones de acción */}
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div className="flex flex-wrap gap-2">
                                <span className="flex items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-2 text-sm">
                                    <Icon name="Calendar" className="w-4 h-4 mr-2 text-custom-orange" />
                                    {formatDateSpanish(eventData?.fecha_inicio)}
                                </span>
                                <span className="flex items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-2 text-sm">
                                    <Icon name="Clock" className="w-4 h-4 mr-2 text-custom-orange" />
                                    {eventData?.hora_inicio}
                                </span>
                            </div>

                            {/* Botones de acción */}
                            {eventData?.can_manage && (
                                <div className="flex items-center hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi rounded-full p-2 transition-colors">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex justify-center items-center p-1">
                                                <Icon name="Ellipsis" className="w-5 h-5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="dark:bg-custom-blackSemi border border-gray-300 dark:border-gray-600">
                                            <DropdownMenuItem onSelect={handleEdit}>
                                                <Icon name="SquarePen" className="w-4 h-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                                                onSelect={() => setIsDestructiveModalOpen(true)}
                                            >
                                                <Icon name="X" className="w-4 h-4 mr-2" />
                                                Eliminar evento
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>

                        {/* Información de entidad */}
                        {(eventData?.entity || eventData?.team || eventData?.empresa || eventData?.departamento) && (
                            <div className="flex items-center text-sm text-custom-gray-dark dark:text-custom-gray-light">
                                <Icon name="Users" className="w-4 h-4 mr-2 text-custom-orange" />
                                <span>
                                    Relacionado con:{" "}
                                    {eventData.entity?.nombre ||
                                        eventData.team?.nombre ||
                                        eventData.empresa?.nombre ||
                                        eventData.departamento?.nombre}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content - Viewer */}
                    <div className="flex-1 min-h-0 mb-4">
                        <div className="h-full overflow-y-auto scrollbar-styled bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl">
                            {parsedDescription && (
                                <div
                                    className="yoopta-viewer-compact p-4"
                                    style={{
                                        '--yoopta-block-margin': '0.25rem',
                                    }}
                                >
                                    <Viewer value={parsedDescription} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer - Información del creador */}
                    <div className="flex-shrink-0">
                        {eventData?.creador && (
                            <div className="flex items-center text-sm text-custom-gray-dark dark:text-custom-gray-light bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-4 py-3">
                                <Icon name="User" className="w-4 h-4 mr-3 text-custom-orange" />
                                <span className="mr-2">Creado por:</span>
                                <div className="flex items-center">
                                    {creador?.profile_photo_url ? (
                                        <img
                                            src={creador.profile_photo_url}
                                            alt={creador.name}
                                            className="h-6 w-6 rounded-full mr-2 object-cover"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full mr-2 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                                {eventData.creador.name
                                                    .split(" ")
                                                    .map((word) => word.charAt(0).toUpperCase())
                                                    .slice(0, 2)
                                                    .join("")}
                                            </span>
                                        </div>
                                    )}
                                    <span className="font-medium">{eventData.creador.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de confirmación para eliminación */}
                {isDestructiveModalOpen && (
                    <DecisionModal
                        title="¿Estás seguro de que quieres eliminar este evento?"
                        content="Esta acción no se puede deshacer. Todos los datos relacionados con este evento se eliminarán."
                        open={isDestructiveModalOpen}
                        onOpenChange={() => setIsDestructiveModalOpen(!isDestructiveModalOpen)}
                        action={manageDelete}
                        variant="destructive"
                        icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
                    />
                )}
            </DialogContent>
        </CustomDialog>
    );
}

export default ViewEventDialog;