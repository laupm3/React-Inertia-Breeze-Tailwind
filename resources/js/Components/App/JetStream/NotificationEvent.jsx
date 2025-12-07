import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { Viewer } from '@/Components/App/Notifications/Yoopta';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";

/**
 * @component NotificationEvent
 * @description Componente limpio que escucha eventos de calendario y muestra notificaciones
 * Usa el hook useBrowserNotifications para gestionar notificaciones nativas del sistema
 */
const NotificationEvent = () => {
    const { t } = useTranslation('events');
    const { calendarEvents } = useNotifications();
    const { showNotification, testToast, hasPermissions, isSupported, permissionStatus } = useBrowserNotifications();
    const [processedIds, setProcessedIds] = useState(new Set());

    // DEBUGGING: Exponer funciones globalmente para testing
    useEffect(() => {
        window.testNotificationSystem = {
            testToast,
            showRecommendation: () => import('@/Components/App/Notifications/NotificationPermissionToast').then(module => module.NotificationPermissionToast.showRecommendation()),
            showBlocked: () => import('@/Components/App/Notifications/NotificationPermissionToast').then(module => module.NotificationPermissionToast.showBlocked()),
            showRejected: () => import('@/Components/App/Notifications/NotificationPermissionToast').then(module => module.NotificationPermissionToast.showRejected()),
            showUnsupported: () => import('@/Components/App/Notifications/NotificationPermissionToast').then(module => module.NotificationPermissionToast.showUnsupported()),
            status: () => ({ hasPermissions, isSupported, permissionStatus, currentPermission: Notification.permission }),
            forcePermissionRequest: async () => {
                try {
                    const permission = await Notification.requestPermission();
                    return permission;
                } catch (error) {
                    return null;
                }
            },
            clearToasts: () => {
                // Función para limpiar todos los toasts
                import('sonner').then(module => module.toast.dismiss());
            }
        };

        return () => {
            delete window.testNotificationSystem;
        };
    }, [testToast, hasPermissions, isSupported, permissionStatus]);

    // Función para parsear la descripción del evento (JSON o texto plano)
    const parseDescription = (description) => {
        if (!description) return null;
        
        if (typeof description === 'object') {
            return description;
        }
        
        try {
            return JSON.parse(description);
        } catch (error) {
            return [
                {
                    id: "fallback-paragraph",
                    type: "paragraph",
                    children: [{ text: description }]
                }
            ];
        }
    };

    // Función para formatear fecha y hora
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        
        const date = new Date(dateString);
        
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Función para mostrar notificación toast interna
    const showNotificationToast = (notification) => {
        const { date, time } = formatDateTime(notification.sent_at || notification.created_at);
        const eventType = notification.title || 'Nuevo evento';
        const eventColor = notification.data?.color || "bg-custom-orange";
        const parsedDescription = parseDescription(notification.message);

        toast(
            <div className="gap-2 w-full">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${eventColor} aspect-square`} />
                    <span className="text-base font-medium">{eventType}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-custom-gray-dark dark:text-custom-gray-light mt-2">
                    <span className="flex items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-2">
                        <Icon name="Calendar" className="w-4 h-4 mr-2 text-custom-orange" />
                        {date}
                    </span>
                    <span className="flex items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-2">
                        <Icon name="Clock" className="w-4 h-4 mr-2 text-custom-orange" />
                        {time}
                    </span>
                </div>

                <div className="w-full dark:dark-scrollbar max-h-[250px] overflow-hidden mt-3 ml-1">
                    <div className="!pb-2 p-2 mb-2 rounded-xl !w-full bg-custom-gray-default dark:bg-custom-blackSemi !text-custom-blackSemi dark:!text-custom-white font-sans !text-sm line-clamp-2 text-ellipsis overflow-hidden">
                        <Viewer value={parsedDescription} />
                    </div>

                    <div className="w-full flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => {
                                window.location.href = '/user/eventos';
                            }}
                        >
                            Ver en calendario
                        </Button>
                    </div>
                </div>
            </div>,
            {
                duration: 5000,
                style: {
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#212529" : "#FFFFFF",
                    border: "none",
                },
            }
        );
    };

    // Procesar nuevos eventos de calendario
    useEffect(() => {
        calendarEvents.forEach(event => {
            if (!processedIds.has(event.id)) {
                setProcessedIds(prev => new Set([...prev, event.id]));
                
                // Crear notificación estructurada
                const notification = {
                    id: event.id,
                    title: event.title || 'Nuevo evento de calendario',
                    message: event.descripcion || 'Se ha agregado un nuevo evento al calendario',
                    sent_at: event.start,
                    sender: event.user || event.creator || event.createdBy || (event.participantes && event.participantes[0]) || null,
                    originalEvent: event,
                    url: '/user/eventos',
                    type: 'calendar-event',
                    data: {
                        color: event.color || 'bg-custom-orange',
                        event_id: event.id,
                        start: event.start,
                        end: event.end
                    }
                };
                
                // Mostrar toast interno (siempre)
                showNotificationToast(notification);
                
                // Mostrar notificación nativa del sistema (solo si navegador minimizado)
                showNotification(notification);
            }
        });
        
        // Limpieza del set de IDs procesados
        return () => {
            if (processedIds.size > 100) {
                const idsArray = Array.from(processedIds);
                setProcessedIds(new Set(idsArray.slice(-50)));
            }
        };
    }, [calendarEvents, showNotification]);

    return null;
};

export default NotificationEvent;
