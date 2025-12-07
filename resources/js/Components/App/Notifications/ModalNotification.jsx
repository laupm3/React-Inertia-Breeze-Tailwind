import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog'
import Icon from '@/imports/LucideIcon'
import { Viewer } from '@/Components/App/Notifications/Yoopta';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";
import { useState, useEffect } from 'react';

/**
 * @component ModalNotification
 * @description Componente modal para mostrar notificaciones detalladas con soporte para contenido rico (Yoopta) y contenido simple.
 * 
 * @param {Object} props
 * @param {Object} props.notification - Objeto de notificación
 * @param {Object} props.notification.sender - Información del remitente
 * @param {string} props.notification.sender.profile_photo_url - URL de la foto de perfil
 * @param {string} props.notification.sender.name - Nombre del remitente
 * @param {string} props.notification.title - Título de la notificación
 * @param {string} props.notification.content - Contenido de texto simple
 * @param {Object} [props.notification.yoopta_content] - Contenido rico en formato Yoopta (opcional)
 * @param {string} props.notification.sent_at - Fecha y hora de envío
 * @param {Function} props.onClose - Función para cerrar el modal
 */
function ModalNotification({ notification: initialNotification, onClose }) {
  const { markAsRead, markAsUnread } = useNotifications();
  // Mantenemos una copia local de la notificación para que los cambios en su estado
  // no causen problemas con el renderizado
  const [notification, setNotification] = useState(initialNotification);
  
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) => new Intl.DateTimeFormat(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(new Date(date));

  // Actualizar la notificación local cuando cambia la prop
  useEffect(() => {
    setNotification(initialNotification);
  }, [initialNotification]);

  /**
   * Cambia el estado de lectura de la notificación
   * @param {Event} e - Evento del navegador
   */
  const handleReadStatusChange = async (e) => {
    e.stopPropagation();
    try {
      if (notification.is_read) {
        await markAsUnread(notification.id);
        // Actualizar estado local para evitar cierre o parpadeos
        setNotification(prev => ({ ...prev, is_read: false }));
        toast.success('Notificación marcada como no leída');
      } else {
        await markAsRead(notification.id);
        // Actualizar estado local para evitar cierre o parpadeos
        setNotification(prev => ({ ...prev, is_read: true }));
        toast.success('Notificación marcada como leída');
      }
    } catch (error) {
      toast.error('Error al cambiar el estado de la notificación');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-custom-white dark:bg-custom-blackSemi p-6 space-y-4 max-w-xl w-full">
        <DialogHeader className="space-y-4">
          <DialogTitle>
            <div className='flex justify-between items-start'>
              {/* Información del remitente */}
              <div className='flex items-start gap-4'>
                <img
                  src={notification.sender.profile_photo_url}
                  alt={notification.sender.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <p className='text-sm font-bold text-custom-orange'>{notification.sender.name}</p>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={handleReadStatusChange}
                            className="text-custom-orange/70 hover:text-custom-orange transition-colors p-1"
                          >
                            <Icon name={notification.is_read ? "MailOpen" : "Mail"} className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{notification.is_read ? "Marcar como no leída" : "Marcar como leída"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className='text-base text-custom-gray-darker dark:text-custom-white'>{notification.title}</p>
                </div>
              </div>

              {/* Metadatos de tiempo */}
              <div className='flex flex-col items-end gap-2 mr-8'>
                <div className='flex items-center gap-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-1'>
                  <Icon name="Calendar" className="w-3.5 h-3.5 text-custom-orange" />
                  <p className='text-xs text-custom-gray-darker dark:text-custom-gray-light'>
                    {formatDate(notification.sent_at)}
                  </p>
                </div>
                <div className='flex items-center gap-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-full px-3 py-1'>
                  <Icon name="Clock" className="w-3.5 h-3.5 text-custom-orange" />
                  <p className='text-xs text-custom-gray-darker dark:text-custom-gray-light'>
                    {formatTime(notification.sent_at)}
                  </p>
                </div>
              </div>
            </div>
          </DialogTitle>
          
          {/* Añadimos DialogDescription para corregir el warning de accesibilidad */}
          <DialogDescription className="sr-only">
            Detalles de la notificación de {notification.sender.name}
          </DialogDescription>
        </DialogHeader>

        {/* Contenido de la notificación */}
        <div className="space-y-4">
          {notification.content && (
            <p className="text-custom-gray-darker dark:text-custom-gray-light text-sm bg-custom-gray-default dark:bg-custom-blackLight p-4 rounded-xl">
              {notification.content}
            </p>
          )}
          
          {notification.yoopta_content && (
            <div className="w-full dark:dark-scrollbar max-h-[250px] overflow-y-auto">
              <Viewer value={notification.yoopta_content} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalNotification;