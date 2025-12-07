import { useState, useEffect } from 'react';
import { usePage } from "@inertiajs/react";
import axios from 'axios';

// Creamos un objeto para manejar los eventos
const NotificationEvents = {
    listeners: new Set(),
    
    // Método para emitir un evento a todos los listeners
    emit(eventType, data) {
        this.listeners.forEach(listener => listener(eventType, data));
    },
    
    // Método para suscribirse a eventos
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
};

/**
 * @function useNotifications
 * @description Hook personalizado para gestionar las notificaciones del usuario.
 * Maneja la conexión WebSocket, recepción de notificaciones en tiempo real y funciones para marcar como leídas.
 * También gestiona eventos de calendario recibidos mediante WebSockets.
 * 
 * @returns {Object} Objeto con las notificaciones y funciones para gestionarlas
 * @returns {Array} notifications - Lista de notificaciones del usuario
 * @returns {number} unreadCount - Número de notificaciones no leídas
 * @returns {Array} calendarEvents - Lista de eventos de calendario recibidos
 * @returns {Function} markAsRead - Función para marcar una notificación como leída
 * @returns {Function} markAsUnread - Función para marcar una notificación como no leída
 * @returns {Function} markAllAsRead - Función para marcar todas las notificaciones como leídas
 * @returns {Function} refreshNotifications - Función para actualizar las notificaciones desde el servidor
 */
export const useNotifications = () => {
    const { auth, notifications: initialNotifications } = usePage().props;
    const [notifications, setNotifications] = useState(initialNotifications || []);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [unreadCount, setUnreadCount] = useState(
        initialNotifications?.filter(n => !n.is_read).length || 0
    );

    // Actualizar el contador de no leídas cuando cambian las notificaciones
    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.is_read).length);
    }, [notifications]);

    // Suscribirse a eventos de notificaciones
    useEffect(() => {
        const unsubscribe = NotificationEvents.subscribe((eventType, data) => {
            if (eventType === 'MARK_AS_READ') {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === data.id
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );
            } else if (eventType === 'MARK_AS_UNREAD') {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === data.id
                            ? { ...notification, is_read: false }
                            : notification
                    )
                );
            } else if (eventType === 'MARK_ALL_AS_READ') {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification => ({
                        ...notification,
                        is_read: true
                    }))
                );
            } else if (eventType === 'NEW_NOTIFICATION') {
                // Verificar si la notificación ya existe antes de añadirla
                setNotifications(prevNotifications => {
                    // Si la notificación ya existe, no la añadimos
                    if (prevNotifications.some(n => n.id === data.id)) {
                        return prevNotifications;
                    }
                    // Si es nueva, la añadimos al principio
                    return [data, ...prevNotifications];
                });
            } else if (eventType === 'NEW_CALENDAR_EVENT') {
                // Añadir nuevo evento al calendario si no existe
                setCalendarEvents(prevEvents => {
                    if (prevEvents.some(event => event.id === data.id)) {
                        return prevEvents;
                    }
                    return [...prevEvents, data];
                });
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        // Asegurarse de que window.Echo esté disponible
        if (!window.Echo) {
            return;
        }

        // Canal privado para notificaciones específicas del usuario
        const privateChannel = window.Echo.private(`App.Models.User.${auth.user.id}`);

        // Canal público para notificaciones generales
        const publicChannel = window.Echo.channel('notifications');

        // Escuchar notificaciones en el canal privado
        privateChannel.notification((notification) => {
            const newNotification = {
                id: notification.id || Date.now(),
                title: notification.title,
                content: notification.message || notification.content,
                sender: notification.sender || { name: 'Sistema' },
                sent_at: notification.timestamp || notification.sent_at || new Date().toISOString(),
                is_read: false,
                ...notification
            };
            
            NotificationEvents.emit('NEW_NOTIFICATION', newNotification);
        });

        // Escuchar eventos del calendario en el canal privado
        privateChannel.listen('.calendar.evento.created', (data) => {
            if (data.evento) {
                const newCalendarEvent = {
                    id: data.evento.id,
                    title: data.evento.title,
                    start: data.evento.start,
                    end: data.evento.end,
                    color: data.evento.color,
                    tipo: data.evento.tipo,
                    descripcion: data.evento.descripcion,
                    participantes: data.evento.participantes || [],
                    // Capturar información adicional del usuario/creador
                    user: data.evento.user || data.user || null,
                    creator: data.evento.creator || data.creator || null,
                    createdBy: data.evento.createdBy || data.createdBy || null,
                    author: data.evento.author || data.author || null,
                    owner: data.evento.owner || data.owner || null,
                    // Guardar todos los datos originales por si acaso
                    _rawData: data
                };
                
                NotificationEvents.emit('NEW_CALENDAR_EVENT', newCalendarEvent);
            }
        });

        // Escuchar eventos específicos en el canal público
        publicChannel.listen('.nueva_empresa', (data) => {
            const newNotification = {
                ...data.notification,
                id: data.notification.id || Date.now(),
                is_read: false,
                sent_at: data.notification.sent_at || new Date().toISOString()
            };
            
            NotificationEvents.emit('NEW_NOTIFICATION', newNotification);
        });

        // Limpiar al desmontar
        return () => {
            privateChannel.stopListening('notification');
            privateChannel.stopListening('.calendar.evento.created');
            publicChannel.stopListening('.nueva_empresa');
        };
    }, [auth.user.id]);

    /**
     * @async
     * @function markAsRead
     * @description Marca una notificación como leída mediante una petición a la API
     * @param {number|string} notificationId - ID de la notificación a marcar
     * @param {boolean} [silentMode=false] - Si es true, no emite eventos para actualizar la UI
     * @returns {boolean} Éxito de la operación
     */
    const markAsRead = async (notificationId, silentMode = false) => {
        try {
            await axios.put(route('api.v1.admin.notifications.markAsRead', notificationId));
            
            // Emitir evento para que todos los componentes se actualicen, solo si no estamos en modo silencioso
            if (!silentMode) {
                NotificationEvents.emit('MARK_AS_READ', { id: notificationId });
            }
            
            return true;
        } catch (error) {
            return false;
        }
    };

    /**
     * @async
     * @function markAsUnread
     * @description Marca una notificación como no leída mediante una petición a la API
     * @param {number|string} notificationId - ID de la notificación a marcar
     * @param {boolean} [silentMode=false] - Si es true, no emite eventos para actualizar la UI
     * @returns {boolean} Éxito de la operación
     */
    const markAsUnread = async (notificationId, silentMode = false) => {
        try {
            await axios.put(route('api.v1.admin.notifications.markAsUnread', notificationId));
            
            // Emitir evento para que todos los componentes se actualicen, solo si no estamos en modo silencioso
            if (!silentMode) {
                NotificationEvents.emit('MARK_AS_UNREAD', { id: notificationId });
            }
            
            return true;
        } catch (error) {
            return false;
        }
    };

    /**
     * @async
     * @function markAllAsRead
     * @description Marca todas las notificaciones como leídas mediante una petición a la API
     * @returns {boolean} Éxito de la operación
     */
    const markAllAsRead = async () => {
        try {
            await axios.put(route('api.v1.admin.notifications.markAllAsRead'));
            
            // Emitir evento para que todos los componentes se actualicen
            NotificationEvents.emit('MARK_ALL_AS_READ');
            
            return true;
        } catch (error) {
            return false;
        }
    };

    /**
     * @async
     * @function refreshNotifications
     * @description Actualiza las notificaciones consultando al servidor
     * @returns {boolean} Éxito de la operación
     */
    const refreshNotifications = async () => {
        try {
            const response = await axios.get(route('api.v1.admin.notifications.index'));
            if (response.data && response.data.notifications) {
                setNotifications(response.data.notifications);
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    return { 
        notifications,
        unreadCount,
        calendarEvents,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        refreshNotifications,
        setNotifications,
        setCalendarEvents
    };
};