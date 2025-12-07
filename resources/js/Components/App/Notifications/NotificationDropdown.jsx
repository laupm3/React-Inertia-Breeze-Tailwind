import { useState, useEffect, useRef } from 'react';
import Icon from '@/imports/LucideIcon';
import { Link } from '@inertiajs/react';
import languages from '@/Shared/Languages';
import { useTranslation } from 'react-i18next';
import { Viewer } from '@/Components/App/Notifications/Yoopta';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from "sonner";

/**
 * @constant {boolean} yooptaNotification - Indica si se debe mostrar una notificación con formato Yoopta.
 */
const yooptaNotification = false;

/**
 * @component NotificationDropdown
 * @description Componente que muestra un dropdown con las notificaciones del usuario.
 * Permite ver, marcar como leídas y gestionar notificaciones.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.notifications - Lista de notificaciones del usuario
 * @param {number} props.unreadCount - Número de notificaciones no leídas
 * @param {Function} props.markAsRead - Función para marcar una notificación como leída
 * @param {Function} props.markAllAsRead - Función para marcar todas las notificaciones como leídas
 * @returns {JSX.Element} Componente de dropdown de notificaciones
 */
export default function NotificationDropdown({
  notifications: initialNotifications,
  unreadCount,
  markAsRead: hookMarkAsRead,
  markAllAsRead: hookMarkAllAsRead
}) {
  /**
   * @type {[Array, Function]} 
   * @description Estado para almacenar las notificaciones
   */
  const [notifications, setNotifications] = useState(initialNotifications || []);

  /**
   * @description Efecto para actualizar las notificaciones cuando cambian las props
   */
  useEffect(() => {
    setNotifications(initialNotifications || []);
  }, [initialNotifications]);

  const { i18n } = useTranslation();
  const { t } = useTranslation('events');

  /**
   * @function currentLanguage
   * @description Obtiene la configuración del idioma actual
   * @returns {Object} Configuración del idioma actual
   */
  const currentLanguage = () => languages.find(language => i18n.language === language.locale);

  /**
   * @function formatDate
   * @description Formatea una fecha según la configuración regional del usuario
   * @param {string|Date} inputDate - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  const formatDate = (inputDate) => new Date(inputDate).toLocaleDateString(
    currentLanguage().cultural_configuration,
    { year: '2-digit', month: 'long', day: 'numeric' }
  );

  /**
   * @function formatTime
   * @description Formatea una hora según la configuración regional del usuario
   * @param {string|Date} inputDate - Fecha/hora a formatear
   * @returns {string} Hora formateada
   */
  const formatTime = (inputDate) => new Date(inputDate).toLocaleTimeString(
    currentLanguage().cultural_configuration,
    { hour: 'numeric', minute: 'numeric' }
  );

  /**
   * @type {[boolean, Function]}
   * @description Estado para controlar si el dropdown está abierto
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * @type {[Object|null, Function]}
   * @description Estado para almacenar la notificación seleccionada para ver en detalle
   */
  const [selectedNotification, setSelectedNotification] = useState(null);

  /**
   * @type {React.RefObject}
   * @description Referencia al elemento DOM del dropdown
   */
  const dropdownRef = useRef(null);

  /**
   * @type {React.RefObject}
   * @description Referencia al botón que abre el dropdown
   */
  const buttonRef = useRef(null);

  /**
   * @function toggleNotifications
   * @description Alterna la visibilidad del dropdown de notificaciones
   */
  const toggleNotifications = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  /**
   * @description Efecto para cerrar el dropdown cuando se hace clic fuera de él
   */
  useEffect(() => {
    /**
     * @function handleClickOutside
     * @description Maneja el evento de clic fuera del dropdown
     * @param {Event} event - Evento del clic
     */
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedNotification(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  /**
   * @async
   * @function openNotification
   * @description Abre una notificación para ver su detalle y la marca como leída si es necesario
   * @param {Object} notification - Notificación a abrir
   */
  const openNotification = async (notification) => {
    // Si la notificación no está leída, la marcamos como leída
    if (!notification.is_read) {
      await hookMarkAsRead(notification.id);
    }

    // Continuamos con la lógica existente
    setSelectedNotification({ ...notification, is_read: true });
    setIsOpen(true);
  };

  /**
   * @function goBackToNotifications
   * @description Vuelve a la lista de notificaciones desde la vista detallada
   */
  const goBackToNotifications = () => {
    setSelectedNotification(null);
  };

  /**
   * @function getInitials
   * @description Obtiene las iniciales del nombre de un usuario
   * @param {string} name - Nombre completo del usuario
   * @returns {string} Inicial del nombre
   */
  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  /**
   * @async
   * @function markAsRead
   * @description Marca una notificación como leída mediante una petición a la API
   * @param {number|string} notificationId - ID de la notificación a marcar
   * @throws {Error} Si hay un error en la petición a la API
   */
  const markAsRead = async (notificationId) => {
    try {
      const success = await hookMarkAsRead(notificationId);

      if (success) {
        // Actualiza el estado local
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      } else {
        toast.error(t('errorMarkingAsRead'));
      }
    } catch (error) {
      toast.error(t('errorMarkingAsRead'));
    }
  };

  /**
   * @async
   * @function markAllAsRead
   * @description Marca todas las notificaciones como leídas mediante una petición a la API
   * @throws {Error} Si hay un error en la petición a la API
   */
  const markAllAsRead = async () => {
    try {
      const success = await hookMarkAllAsRead();

      if (success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            is_read: true
          }))
        );

        toast.success(t('allNotificationsMarkedAsRead'));
      } else {
        toast.error(t('errorMarkingAllAsRead'));
      }
    } catch (error) {
      toast.error(t('errorMarkingAllAsRead'));
    }
  };

  return (
    <nav className="bg-custom-white dark:bg-custom-blackLight">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex space-x-4">
          {/* Botón de notificaciones con indicador de notificaciones no leídas */}
          <button
            ref={buttonRef}
            onClick={toggleNotifications}
            className="relative p-2 bg-custom-gray-light dark:bg-custom-gray-darker hover:bg-custom-gray-dark rounded-full focus:outline-none"
          >
            <Icon name="Bell" className="text-custom-blackSemi dark:text-white h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] bg-red-500 rounded-full text-white text-[9px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de lista de notificaciones */}
          {isOpen && !selectedNotification && createPortal(
            <div
              ref={dropdownRef}
              className="fixed top-12 right-12 w-80 bg-custom-gray-default dark:bg-custom-blackSemi shadow-lg rounded-2xl p-4 z-40"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-center text-lg font-bold text-custom-orange">
                  {t('notifications')}
                </h2>
                {/* Botón para marcar todas como leídas (solo visible si hay notificaciones no leídas) */}
                {notifications.some(n => !n.is_read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-custom-orange hover:text-custom-gray-darker dark:hover:text-custom-gray-light"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              {notifications.length > 0 ? (
                <>
                  {/* Lista de notificaciones (máximo 10) */}
                  <ul className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.slice(0, 10).map((notification) => (
                      <li
                        key={notification.id}
                        className={`flex items-start space-x-3 p-2 cursor-pointer dark:hover:bg-custom-gray-semiDark hover:bg-custom-gray-light rounded-lg ${notification.is_read ? 'opacity-30' : ''}`}
                        onClick={() => openNotification(notification)}
                      >
                        {/* Avatar del remitente */}
                        <div className="relative flex-shrink-0">
                          {notification.sender.profile_photo_url ? (
                            <img
                              src={notification.sender.profile_photo_url}
                              alt={notification.sender.name}
                              className="w-10 h-10 rounded-full bg-custom-gray-dark"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-custom-white dark:bg-custom-gray-semiDark rounded-full flex items-center justify-center">
                              <span className="text-sm text-custom-blackLight dark:text-custom-white font-bold">
                                {getInitials(notification.sender.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Contenido de la notificación */}
                        <div className="flex-grow">
                          <div className='flex items-center justify-between'>
                            <p className="text-sm font-medium text-custom-blackLight dark:text-custom-white">{notification.sender.name}</p>
                            <p className='text-[8px] text-custom-gray-darker dark:text-custom-gray-light'>{formatDate(notification.sent_at)}</p>
                          </div>
                          {notification.title &&
                            <p className=" text-xs line-clamp-2 text-custom-gray-darker dark:text-custom-gray-light">
                              {notification.title}
                            </p>
                          }
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Enlace para ver todas las notificaciones */}
                  <div className="text-center text-sm mt-2 font-bold pt-3">
                    <Link href={route("notifications")} className="text-custom-orange hover:text-custom-black duration-300">
                      {t('seeAll')}
                    </Link>
                  </div>
                </>
              ) : (
                // Mensaje cuando no hay notificaciones
                <div className="flex items-center justify-center">
                  <Icon name="BellOff" className="text-custom-blackSemi dark:text-white h-4 w-4" />
                </div>
              )}
            </div>,
            document.body
          )}

          {/* Vista detallada de una notificación seleccionada */}
          {selectedNotification && createPortal(
            <div
              ref={dropdownRef}
              className="fixed top-12 right-12 w-80 bg-custom-gray-default dark:bg-custom-blackSemi shadow-lg rounded-2xl p-4 z-40"
            >
              <div className="p-2">
                {/* Cabecera con botón de retorno e información del remitente */}
                <div className="flex items-center mb-2 relative gap-2">
                  <button onClick={goBackToNotifications}>
                    <Icon name="ArrowLeft" size='14' />
                  </button>
                  {selectedNotification.sender.profile_photo_url ? (
                    <img
                      src={selectedNotification.sender.profile_photo_url}
                      alt={selectedNotification.sender.name}
                      className="w-10 h-10 rounded-full bg-custom-gray-dark"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-custom-white dark:bg-custom-gray-semiDark rounded-full flex items-center justify-center">
                      <span className="text-sm text-custom-blackLight dark:text-custom-white font-bold">
                        {getInitials(selectedNotification.sender.name)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedNotification.sender.name}</p>
                    <p className="text-gray-500 text-sm">{t('nonEspecificJob')}</p>
                  </div>
                </div>
                {/* Información de fecha y hora */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center text-custom-gray-semiDark dark:text-custom-white bg-custom-white dark:bg-custom-gray-darker py-1 px-2 rounded-full">
                    <span className="mr-2">
                      <Icon name="Calendar" size='14' className='text-custom-orange' />
                    </span>
                    <p className='text-xs'>{formatDate(selectedNotification.sent_at)}</p>
                  </div>
                  <div className="flex items-center text-custom-gray-semiDark dark:text-custom-white ml-4 bg-custom-white dark:bg-custom-gray-darker py-1 px-2 rounded-full">
                    <span className="mr-2">
                      <Icon name="Clock" size='14' className='text-custom-orange' />
                    </span>
                    <p className='text-xs'>{formatTime(selectedNotification.sent_at)}</p>
                  </div>
                </div>
                {/* Contenido de la notificación */}
                {selectedNotification.title && (
                  <p className="max-h-60 overflow-y-auto no-scrollbar text-custom-gray-semiDark dark:text-custom-white mb-3 bg-custom-white dark:bg-custom-gray-darker py-1 px-2 rounded-xl">
                    {selectedNotification.content}
                  </p>
                )}
                {/* Contenido enriquecido con Yoopta si está disponible */}
                {yooptaNotification && (
                  <Viewer value={yooptaNotification} />
                )}
                {/* Enlace para ver en calendario */}
                <Link href={route("notifications")} className="text-custom-orange hover:text-custom-black dark:hover:text-custom-gray-dark duration-300">
                  {t('seeOnCalendar')}
                </Link>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </nav>
  );
};