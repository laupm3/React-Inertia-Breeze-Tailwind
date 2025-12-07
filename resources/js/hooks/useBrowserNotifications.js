import { useState, useEffect } from 'react';
import { NotificationPermissionToast } from '@/Components/App/Notifications/NotificationPermissionToast';

/**
 * @hook useBrowserNotifications
 * @description Hook para gestionar notificaciones nativas del navegador de manera inteligente
 * - Detecta si el navegador está minimizado/en segundo plano
 * - Gestiona permisos automáticamente según el navegador
 * - Solo muestra notificaciones nativas cuando el usuario no está activo
 * - Compatible con Chrome, Firefox, Edge, Opera
 * - Informa al usuario si las notificaciones están bloqueadas
 * 
 * @returns {Object} API del hook
 * @returns {boolean} isWindowVisible - Si la ventana está visible
 * @returns {boolean} hasPermissions - Si tiene permisos de notificación
 * @returns {boolean} isSupported - Si el navegador soporta notificaciones * @returns {string} permissionStatus - Estado actual: 'granted', 'denied', 'default', 'unsupported'
 * @returns {Function} showNotification - Función para mostrar notificación nativa
 * @returns {Function} requestPermissions - Función para solicitar permisos manualmente
 */
export const useBrowserNotifications = () => {
    const [isWindowVisible, setIsWindowVisible] = useState(true);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('default');
    const [hasShownBlockedToast, setHasShownBlockedToast] = useState(false);

    // Detectar si el navegador está minimizado o en segundo plano
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsWindowVisible(!document.hidden);
        };

        const handleWindowFocus = () => {
            setIsWindowVisible(true);
        };

        const handleWindowBlur = () => {
            setIsWindowVisible(false);
        };

        // Eventos para detectar si la ventana está visible
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('blur', handleWindowBlur);        };
    }, []);    // Gestión inteligente de permisos de notificación
    useEffect(() => {
        const managePermissions = async () => {
            if (!('Notification' in window)) {
                setIsSupported(false);
                setPermissionStatus('unsupported');
                setHasPermissions(false);
                return;
            }

            setIsSupported(true);
            const currentPermission = Notification.permission;
            setPermissionStatus(currentPermission);

            if (currentPermission === 'granted') {
                setHasPermissions(true);
                return;
            }

            if (currentPermission === 'denied') {
                setHasPermissions(false);
                return;
            }

            // Si está en 'default', solo configurar estado, NO mostrar toast automáticamente
            if (currentPermission === 'default') {
                setHasPermissions(false);
            }
        };

        managePermissions();
    }, []);

    /**
     * Solicita permisos de notificación con compatibilidad entre navegadores
     */
    const requestPermissions = async () => {
        if (!('Notification' in window)) {
            throw new Error('Browser does not support notifications');
        }

        const userAgent = navigator.userAgent;
        const isFirefox = userAgent.includes('Firefox');
        const isEdge = userAgent.includes('Edg/');

        let permission;

        try {
            if (isFirefox) {
                // Firefox requiere método específico
                if (Notification.requestPermission.length === 0) {
                    permission = await Notification.requestPermission();
                } else {
                    permission = await new Promise((resolve) => {
                        Notification.requestPermission(resolve);
                    });
                }
            } else if (isEdge) {
                // Edge puede necesitar un pequeño retraso
                await new Promise(resolve => setTimeout(resolve, 100));
                permission = await Notification.requestPermission();
            } else {
                // Chrome, Opera y otros
                permission = await Notification.requestPermission();
            }

            return permission;
        } catch (error) {
            throw new Error(`Failed to request permissions: ${error.message}`);
        }
    };

    /**
     * Extrae el nombre del usuario de diferentes estructuras de datos
     */
    const extractUserName = (notification) => {
        if (notification.sender?.name) return notification.sender.name;
        
        if (notification.originalEvent) {
            const event = notification.originalEvent;
            if (event.user?.name) return event.user.name;
            if (event.creator?.name) return event.creator.name;
            if (event.createdBy?.name) return event.createdBy.name;
            if (event.author?.name) return event.author.name;
            if (event.owner?.name) return event.owner.name;
            if (event.participantes?.length > 0) {
                const firstParticipant = event.participantes[0];
                return firstParticipant.name || firstParticipant.username || firstParticipant.email;
            }
        }

        return 'Sistema';
    };

    /**
     * Formatea fecha y hora para mostrar en notificaciones
     */
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        
        const date = new Date(dateString);
        
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };    };

    /**
     * Muestra una notificación nativa del sistema
     * Solo se muestra si el navegador está minimizado y hay permisos
     * Toast educativo SOLO aparece cuando se intenta notificar con navegador minimizado
     */
    const showNotification = (notification) => {
        // Verificar soporte del navegador
        if (!isSupported) {
            NotificationPermissionToast.showUnsupported();
            return false;
        }

        // Solo mostrar si el navegador está minimizado (ventana no visible)
        // Si está maximizado, NO intentar notificación ni mostrar toast
        if (isWindowVisible) {
            return false;
        }        // Verificar permisos - SOLO mostrar toast si se intenta notificar y navegador está minimizado
        if (!hasPermissions) {
            if (permissionStatus === 'denied') {
                NotificationPermissionToast.showBlocked();
            } else if (permissionStatus === 'default') {
                NotificationPermissionToast.showRecommendation();
            }
            return false;
        }

        try {
            const { date, time } = formatDateTime(notification.sent_at || notification.created_at);
            const title = notification.title || 'Nueva notificación';
            const senderName = extractUserName(notification);
            const body = `📅 ${date} ⏰ ${time}\n👤 Creado por ${senderName}`;

            // Configuración específica por navegador
            const userAgent = navigator.userAgent;
            const isFirefox = userAgent.includes('Firefox');
            
            const notificationConfig = {
                body: body,
                icon: '/favicon.ico',
                tag: `notification-${notification.id}`,
                requireInteraction: false,
                silent: false,
                data: {
                    id: notification.id,
                    type: notification.type || 'general',
                    url: notification.url || '/notifications'
                }
            };

            // Firefox no soporta algunas propiedades
            if (isFirefox) {
                delete notificationConfig.timestamp;
                delete notificationConfig.badge;
            } else {
                notificationConfig.badge = '/favicon.ico';
                notificationConfig.timestamp = new Date(notification.sent_at || Date.now()).getTime();
            }

            const nativeNotification = new Notification(title, notificationConfig);

            // Manejar clic en la notificación
            nativeNotification.onclick = (event) => {
                event.preventDefault();
                
                // Enfocar ventana
                if (window.parent) {
                    window.parent.focus();
                }
                window.focus();

                // Navegar si hay URL
                if (notification.url || notificationConfig.data.url) {
                    window.location.href = notification.url || notificationConfig.data.url;
                }
                
                nativeNotification.close();
            };

            // Auto-cerrar después de 8 segundos
            setTimeout(() => {
                nativeNotification.close();
            }, 8000);

            return true;

        } catch (error) {
            return false;
        }
    };    return {
        isWindowVisible,
        hasPermissions,
        isSupported,
        permissionStatus,
        showNotification,
        requestPermissions,
        // Método de prueba para debugging
        testToast: () => NotificationPermissionToast.showTest()
    };
};
