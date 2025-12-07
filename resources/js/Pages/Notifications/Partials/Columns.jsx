import { useState } from "react";
import { Button } from "@/Components/ui/button";
import Checkbox from "@/Components/Checkbox";
import { ArrowUpDown } from "lucide-react";
import Icon from '@/imports/LucideIcon';
import ModalNotification from "@/Components/App/Notifications/ModalNotification";
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from "sonner";
import { useNotificationRow } from "../Hooks/useNotificationRow";

/**
 * @typedef {Object} NotificationRow
 * @property {string} id - ID de la notificación
 * @property {string} title - Título de la notificación
 * @property {Object} sender - Información del remitente
 * @property {string} sender.name - Nombre del remitente
 * @property {string} sender.profile_photo_url - URL de la foto de perfil
 * @property {boolean} is_read - Estado de lectura de la notificación
 * @property {string} sent_at - Fecha de envío
 * @property {string} notifiable_model - Tipo de notificación
 * @property {string} action_model - Tipo de acción
 */

/**
 * Renderiza el header del checkbox para selección múltiple
 * @param {Object} table - Instancia de la tabla
 * @param {Function} t - Función de traducción
 * @returns {JSX.Element} Checkbox para seleccionar/deseleccionar todas las filas
 */
const renderCheckboxHeader = (table, t) => (
    <Checkbox
        checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t("datatable.selectAll")}
        className="border-custom-orange border-2"
    />
);

/**
 * Renderiza el checkbox de cada fila
 * @param {Object} row - Datos de la fila
 * @param {Function} t - Función de traducción
 * @returns {JSX.Element} Checkbox para seleccionar/deseleccionar una fila
 */
const renderCheckboxCell = (row, t) => (
    <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t("datatable.selectRow")}
        className="border-custom-orange border-2"
    />
);

/**
 * Renderiza el encabezado con botón de ordenamiento
 * @param {Object} column - Configuración de la columna
 * @param {string} label - Etiqueta a mostrar
 * @returns {JSX.Element} Botón de ordenamiento
 */
const renderSortableHeader = (column, label) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
);

/**
 * Renderiza la celda de una notificación con su contenido y acciones
 * @param {Object} row - Fila de la tabla que contiene la notificación
 * @returns {JSX.Element} Celda con la información de la notificación
 */
const renderNameCell = (row) => {
  // Usamos el hook personalizado para manejar la lógica de la fila
  const {
    openModalId,
    localNotification,
    handleNotificationClick,
    handleReadStatusToggle,
    handleModalClose
  } = useNotificationRow(row);

  return (
    <>
      {/* componente de modal */}
      {openModalId === row.original.id && localNotification && (
        <ModalNotification 
          onClose={handleModalClose} 
          notification={localNotification} 
        />
      )}
      <div
        key={row.original.id}
        className={`md:flex justify-between gap-4 p-4 hover:bg-custom-gray-light/50 dark:hover:bg-custom-gray-darker rounded-xl duration-300 cursor-pointer group ${row.original.is_read ? 'opacity-30' : ''}`}
        onClick={() => handleNotificationClick(row.original)}
      >
        <div className='flex items-start gap-4 w-full'>
          <div>
            <img
              src={row.original.sender.profile_photo_url}
              alt={row.original.sender.name}
              className="w-8 h-8 rounded-full"
            />
          </div>
  
          <div className='flex flex-col w-full'>
            <p className='text-xs font-bold text-custom-orange'>{row.original.sender.name}</p>
            <div className='transition-all duration-700 ease-in-out no-scrollbar'>
              <p className='text-sm text-justify transition-opacity duration-700 ease-in-out'>
                <span className='text-base font-bold text-custom-blue dark:text-custom-white'>
                  {row.original.title}
                </span>
              </p>
            </div>
          </div>
        </div>
  
        <div className='flex flex-col min-w-32 justify-start mt-2 items-end'>
          <button
            onClick={(e) => handleReadStatusToggle(e, row.original)}
            className={`mb-2 text-xs opacity-0 group-hover:opacity-100 flex items-center gap-1 text-custom-orange hover:text-custom-blue transition-opacity ${row.original.is_read ? 'opacity-100' : ''}`}
            title={row.original.is_read ? "Marcar como no leído" : "Marcar como leído"}
          >
            <Icon name={row.original.is_read ? "MailOpen" : "Mail"} size="14" />
            <span>{row.original.is_read ? "No leído" : "Leído"}</span>
          </button>
          <div className='flex items-center'>
            <Icon name="Calendar" size='12' className="mr-2" />
            <p className='text-xs'>{new Date(row.original.sent_at).toLocaleDateString()}</p>
          </div>
          <div className='flex items-center'>
            <Icon name="Clock" size='12' className="mr-2" />
            <p className='text-xs'>
              {`${String(new Date(row.original.sent_at).getHours()).padStart(2, '0')}:${String(new Date(row.original.sent_at).getMinutes()).padStart(2, '0')}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Define la configuración de columnas para la tabla de notificaciones
 * @param {Function} t - Función de traducción
 * @returns {Array} Array de configuración de columnas
 */
export const columns = (t) => [
    {
        id: "selector",
        header: ({ table }) => renderCheckboxHeader(table, t),
        cell: ({ row }) => renderCheckboxCell(row, t),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "read_status",
        accessorFn: (row) => ({
            title: row.title,
            sender: row.sender.name,
            is_read: row.is_read
        }),
        header: ({ column }) => (""),
        cell: ({ row }) => renderNameCell(row),
        enableSorting: false,
        enableHiding: false,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
                return true;
            }
            return filterValue.some(status => {
                if (status === "unread") return !row.original.is_read;
                if (status === "read") return row.original.is_read;
                return false;
            });
        }
    },
    {
        accessorKey: "notifiable_model",
        isHidden: true,
        enableHiding: false,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
                return true;
            }
            return filterValue.includes(row.original.notifiable_model);
        }
    },
    {
        accessorKey: "action_model",
        isHidden: true,
        enableHiding: false,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
                return true;
            }
            return filterValue.includes(row.original.action_model);
        }
    },
    {
        accessorKey: "sender_id",
        isHidden: true,
        enableHiding: false,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
                return true;
            }
            const senderId = String(row.original.sender?.id);
            return filterValue.some(value => String(value) === senderId);
        }
    },
    {
        accessorKey: "sent_at",
        isHidden: true,
        enableHiding: false,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || !filterValue.from || !filterValue.to) {
                return true;
            }

            const date = new Date(row.original.sent_at);
            const from = new Date(filterValue.from);
            const to = new Date(filterValue.to);
            to.setHours(23, 59, 59, 999);

            return date >= from && date <= to;
        }
    }
];

