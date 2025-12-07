import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/Components/DataTable/DataTable";
import { columns } from "@/Pages/Notifications/Partials/Columns";
import TableToolbar from '@/Pages/Notifications/Partials/TableToolbar';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

/**
 * @typedef {Object} AllNotificationsTableProps
 * No requiere props ya que utiliza el hook useNotifications para manejar el estado
 */

/**
 * Componente principal para la tabla de notificaciones.
 * Muestra todas las notificaciones del usuario con funcionalidades de filtrado,
 * ordenamiento y marcado de lectura.
 * 
 * @returns {JSX.Element} Tabla de notificaciones con su toolbar y funcionalidades
 */
export default function AllNotificationsTable() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const { t } = useTranslation();

  /**
   * Maneja el marcado de todas las notificaciones como leídas
   * Muestra un toast de éxito o error según el resultado
   * @async
   * @returns {Promise<void>}
   */
  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success(t('allNotificationsMarkedAsRead', 'Todas las notificaciones marcadas como leídas'));
    } else {
      toast.error(t('errorMarkingAllAsRead', 'Error al marcar todas las notificaciones como leídas'));
    }
  };

  // Escuchar evento de actualización de notificaciones desde TableToolbar
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      refreshNotifications();
    };

    window.addEventListener('notifications-updated', handleNotificationsUpdated);
    
    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdated);
    };
  }, [refreshNotifications]);

  return (
    <>
      <Head title="Notificaciones" />
      <div className="max-w-full mx-auto py-7 xl:px-8 px-4">
        <DataTable
          columns={columns}
          records={notifications}
          toolbarComponent={(props) => (
            <TableToolbar 
              {...props} 
              unreadCount={unreadCount}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          )}
        />
      </div>
    </>
  );
}

AllNotificationsTable.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
