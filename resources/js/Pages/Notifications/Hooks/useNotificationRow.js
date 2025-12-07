import { useState } from "react";
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from "sonner";

/**
 * @function useNotificationRow
 * @description Hook personalizado para manejar la lógica específica de una fila de notificación.
 * Este hook complementa el hook global useNotifications, añadiendo funcionalidad específica
 * para gestionar la interacción del usuario con las filas de notificaciones en la tabla.
 * 
 * Nota: Este hook NO duplica la funcionalidad de useNotifications, sino que la extiende
 * para el caso de uso específico de las filas de la tabla.
 * 
 * @param {Object} row - Fila de la tabla que contiene la notificación
 * @returns {Object} Estado y funciones para manejar la fila de notificación
 * @returns {string|null} openModalId - ID del modal abierto, o null si no hay modal
 * @returns {Object|null} localNotification - Copia local de la notificación
 * @returns {Function} handleNotificationClick - Función para gestionar el clic en una notificación
 * @returns {Function} handleReadStatusToggle - Función para alternar el estado de lectura
 * @returns {Function} handleModalClose - Función para cerrar el modal
 */
export const useNotificationRow = (row) => {
  // Estados locales específicos para la interacción con la fila
  const [openModalId, setOpenModalId] = useState(null);
  const [localNotification, setLocalNotification] = useState(null);
  
  // Obtenemos las funciones globales del hook useNotifications
  const { 
    markAsRead, 
    markAsUnread, 
    notifications, 
    setNotifications 
  } = useNotifications();
  
  /**
   * Maneja el clic en una notificación, abriendo el modal y marcándola como leída si es necesario.
   * Esta función extiende la funcionalidad básica de markAsRead con operaciones específicas
   * para la UI, como abrir el modal y mantener una copia local de la notificación.
   * 
   * @param {Object} notification - Notificación a procesar
   */
  const handleNotificationClick = async (notification) => {
      // Primero establecemos el estado local y abrimos el modal
      setOpenModalId(notification.id);
      setLocalNotification(notification);
      
      // Si la notificación no está leída, la marcamos como leída
      if (!notification.is_read) {
          try {
              // Usamos el modo silencioso para no emitir eventos que refrescarían automáticamente la tabla
              const success = await markAsRead(notification.id, true);
              
              if (success) {
                  // Actualizamos nuestra copia local para el modal
                  setLocalNotification(prev => prev ? {...prev, is_read: true} : {...notification, is_read: true});
                  
                  // Actualizamos inmediatamente el estado global para que se refleje en la tabla
                  setNotifications(prevNotifications =>
                      prevNotifications.map(n =>
                          n.id === notification.id ? { ...n, is_read: true } : n
                      )
                  );
                  
                  // Importante: forzamos la actualización de la fila actual
                  row.original.is_read = true;
                  
                  // Indicamos al usuario que la notificación se ha marcado como leída
                  toast.success('Notificación marcada como leída');
              }
          } catch (error) {
              console.error('Error al marcar como leída:', error);
              toast.error('Error al marcar la notificación como leída');
          }
      }
  };

  /**
   * Marca una notificación específica como leída o no leída, manteniendo 
   * la fecha de primera lectura en el campo read_at.
   * 
   * Esta función extiende la funcionalidad básica de markAsRead/markAsUnread con
   * operaciones específicas para la UI, como actualizar la copia local y
   * prevenir la propagación de eventos.
   * 
   * @param {Event} e - Evento del navegador
   * @param {Object} notification - Notificación a modificar
   */
  const handleReadStatusToggle = async (e, notification) => {
      e.stopPropagation(); // Evita que se propague al onClick del div padre
      
      try {
          // Usamos modo silencioso siempre para evitar refrescos automáticos
          const isSilent = true;
          let success;
          
          if (notification.is_read) {
              success = await markAsUnread(notification.id, isSilent);
              
              if (success) {
                  // Actualizamos la copia local si está abierta
                  if (openModalId === notification.id) {
                      setLocalNotification(prev => ({...prev, is_read: false}));
                  }
                  
                  // Actualizamos el estado global para que se refleje en la tabla
                  setNotifications(prevNotifications =>
                      prevNotifications.map(n =>
                          n.id === notification.id ? { ...n, is_read: false } : n
                      )
                  );
                  
                  // Forzamos la actualización de la fila actual
                  notification.is_read = false;
                  
                  // Feedback al usuario
                  toast.success('Notificación marcada como no leída');
              } else {
                  toast.error('Error al marcar la notificación como no leída');
              }
          } else {
              success = await markAsRead(notification.id, isSilent);
              
              if (success) {
                  // Actualizamos la copia local si está abierta
                  if (openModalId === notification.id) {
                      setLocalNotification(prev => ({...prev, is_read: true}));
                  }
                  
                  // Actualizamos el estado global para que se refleje en la tabla
                  setNotifications(prevNotifications =>
                      prevNotifications.map(n =>
                          n.id === notification.id ? { ...n, is_read: true } : n
                      )
                  );
                  
                  // Forzamos la actualización de la fila actual
                  notification.is_read = true;
                  
                  // Feedback al usuario
                  toast.success('Notificación marcada como leída');
              } else {
                  toast.error('Error al marcar la notificación como leída');
              }
          }
      } catch (error) {
          console.error('Error al cambiar el estado de lectura:', error);
          toast.error('Error al cambiar el estado de la notificación');
      }
  };

  /**
   * Maneja el cierre del modal, sincronizando cualquier cambio de estado
   * entre la copia local y el estado global.
   */
  const handleModalClose = () => {
      // Si hay un cambio en el estado del localNotification, debemos asegurarnos
      // de que se refleje correctamente en la interfaz
      if (localNotification && openModalId) {
          const notificationIndex = notifications.findIndex(n => n.id === openModalId);
          if (notificationIndex !== -1 && notifications[notificationIndex].is_read !== localNotification.is_read) {
              // Actualizamos el estado global para que coincida con el estado local
              setNotifications(prevNotifications =>
                  prevNotifications.map(n =>
                      n.id === openModalId ? { ...n, is_read: localNotification.is_read } : n
                  )
              );
              
              // También actualizamos la fila actual si es necesario
              if (row.original.id === openModalId) {
                  row.original.is_read = localNotification.is_read;
              }
          }
      }
      
      // Limpiamos los estados
      setOpenModalId(null);
      setLocalNotification(null);
  };

  return {
    openModalId,
    localNotification,
    handleNotificationClick,
    handleReadStatusToggle,
    handleModalClose
  };
}; 