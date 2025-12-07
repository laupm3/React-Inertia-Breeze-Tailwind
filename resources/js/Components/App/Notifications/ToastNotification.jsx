import { useState, useEffect, useMemo } from 'react'
import Icon from '@/imports/LucideIcon';
import { Link as InertiaLink } from '@inertiajs/react';
import { toast } from "sonner";
import { Viewer } from '@/Components/App/Notifications/Yoopta';
import { useTranslation } from 'react-i18next';

function ToastNotification({ img = false, title = "", date = "", time = "", open = false, onClose, editedNotification = null }) {
  const [isOpen, setIsOpen] = useState(open);
  const { t } = useTranslation('events');

  useEffect(() => {
    setIsOpen(open);

    if (open) {
      showSystemNotification();

      if (editedNotification) {
        toast(
          <Viewer value={editedNotification} />,
          {
            duration: 5000,
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }
          }
        );
      } else {
        toast(
          <div className='w-full'>
            {img && (
              <div className='w-full h-32 mb-4 overflow-hidden rounded-xl'>
                <img className='w-full h-full object-cover' src={img} alt={title} />
              </div>
            )}
            <div className='flex justify-between items-center space-y-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-custom-orange rounded-full' />
                  <p className='font-medium'>{title}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon name='Calendar' size='14' />
                  <p className='text-xs'>{date}</p>

                  <Icon name='Clock' size='14' />
                  <p className='text-xs'>{time}</p>
                </div>
              </div>
              <div className='ml-4'>
                <InertiaLink href={route("notifications")}>
                  <button className='px-2 py-1 border border-custom-blackLight hover:bg-custom-gray-light dark:hover:bg-custom-gray-sidebar rounded-lg duration-300'>
                    {t("seeNotification")}
                  </button>
                </InertiaLink>
              </div>
            </div>
          </div>
        );
      }
    }
  }, [open, onClose, editedNotification]);

  const showSystemNotification = () => {
    if ("Notification" in window) {
      if (Notification.permission === "denied") {
        // Si las notificaciones están denegadas, informamos al usuario
        toast.error(t('notificationBlock'));
      } else if (Notification.permission === "default") {
        // Si el permiso está en estado "default", pedimos permiso
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(title, {
              body: `${date} - ${time}`,
              icon: img
            });
          } else {
            toast.error(t('notificationDenied'));
          }
        });
      } else if (Notification.permission === "granted") {
        // Si ya tenemos permiso, mostramos la notificación
        new Notification(title, {
          body: `${date} - ${time}`,
          icon: img
        });
      }
    } else {
      toast.error(t('notificationNotSupported'));
    }
  };

  return (
    <></>
  )
}

export default ToastNotification
