import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "sonner";

import { Input } from '@/Components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/Components/ui/dropdown-menu";
import { Button } from '@/Components/App/Buttons/Button'; 
import VistaPermiso from '@/Pages/User/Vacaciones/Components/VistaPermiso';
import CreateUpdateDialog from '@/Pages/User/Vacaciones/Partials/CreateUpdateDialog';
import DecisionModal from "@/Components/App/Modals/DecisionModal";

import Events from '@/Blocks/Events/Events';

import Icon from '@/imports/LucideIcon';

// Funciones auxiliares para formatear datos
/**
 * Formatea una cadena de fecha al formato "dd mes yyyy" (ej: "12 oct 2025").
 * @param {string} dateString - La cadena de fecha a formatear.
 * @returns {string} La fecha formateada o una cadena vacía si la entrada es inválida.
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Obtiene el nombre del día de la semana para una fecha dada, capitalizado.
 * @param {string} dateString - La cadena de fecha.
 * @returns {string} El nombre del día de la semana (ej: "Domingo") o una cadena vacía.
 */
const getDayOfWeek = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; 
  let day = date.toLocaleDateString('es-ES', { weekday: 'long' });
  return day.charAt(0).toUpperCase() + day.slice(1);
};

/**
 * Componente HistoricLayout: Muestra el historial de solicitudes de permiso del usuario,
 * un calendario de eventos y permite la creación de nuevas solicitudes.
 * @param {object} props - Propiedades del componente.
 * @param {Array<object>} [props.solicitudesPermiso=[]] - Lista inicial de solicitudes de permiso (opcional).
 */
function HistoricLayout({ solicitudesPermiso: initialSolicitudes = [] }) {

  // Estados del componente
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); 
  const [isOpenDialog, setIsOpenDialog] = useState(false); 
  const [permisoToEdit, setPermisoToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [solicitudesPermiso, setSolicitudesPermiso] = useState(initialSolicitudes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permisoToDelete, setPermisoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar solicitudes de vacaciones desde la API
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/user/vacaciones');
      
      // El controlador devuelve { vacaciones: [...] }
      const data = response.data.vacaciones || [];
      setSolicitudesPermiso(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar vacaciones:', error);
      setError('Error al cargar las solicitudes de vacaciones');
      // Establecer array vacío en caso de error
      setSolicitudesPermiso([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // Función para refrescar los datos después de crear/editar
  const refreshSolicitudes = () => {
    fetchSolicitudes();
  }; 

  /**
   * Limpia los filtros aplicados. Por ahora, solo reinicia el término de búsqueda.
   */
  const handleClearFilters = () => {
    setSearchTerm("");
    // Aquí se podrían añadir más reseteos de filtros si se implementan.
  };

  // Función para abrir el diálogo en modo edición
  const handleEditPermiso = (permiso) => {
    setPermisoToEdit(permiso);
    setIsOpenDialog(true);
  };

  // Función para abrir el diálogo en modo creación
  const handleCreatePermiso = () => {
    setPermisoToEdit(null); 
    setIsOpenDialog(true);
  };

  // Función para eliminar un permiso
  const handleDeletePermiso = async (permiso) => {
    setPermisoToDelete(permiso);
    setShowDeleteModal(true);
  };

  // Función para manejar la solicitud de cancelación
  const handleRequestCancellation = (permiso) => {
    setPermisoToDelete(permiso);
    setShowDeleteModal(true);
  };

  // Función para confirmar la eliminación o cancelación
  const confirmDeletePermiso = async () => {
    if (!permisoToDelete) return;
    
    setIsDeleting(true);
    
    const isDeleteAction = permisoToDelete.estado?.nombre === "Solicitado";
    
    try {
      if (isDeleteAction) {
        // Hacer la petición DELETE a la API
        await axios.delete(`/api/v1/user/vacaciones/${permisoToDelete.id}`);
        
        // Mostrar notificación de éxito
        toast.success('Solicitud eliminada correctamente', {
          description: `La solicitud de vacaciones "${permisoToDelete.tipo_permiso_nombre || 'Vacaciones'}" ha sido eliminada.`
        });
      } else {
        // Hacer la petición POST para solicitar cancelación usando la misma ruta que solicitudes
        await axios.post(`/api/v1/user/solicitudes/${permisoToDelete.id}/toggle-cancellation-request`);
        
        // Mostrar notificación de éxito
        toast.success('Solicitud de cancelación enviada', {
          description: `Se ha enviado la solicitud de cancelación para "${permisoToDelete.tipo_permiso_nombre || 'Vacaciones'}".`
        });
      }
      
      // Refrescar la lista de solicitudes
      refreshSolicitudes();
      
      // Cerrar el modal
      setShowDeleteModal(false);
      setPermisoToDelete(null);
      
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      
      // Mostrar notificación de error
      const actionText = isDeleteAction ? 'eliminar' : 'solicitar cancelación de';
      toast.error(`Error al ${actionText} la solicitud`, {
        description: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar solicitudes de permiso basado en el término de búsqueda.
  // La búsqueda se realiza en el nombre del permiso, motivo, estado y nombre del empleado.
  const filteredSolicitudes = (solicitudesPermiso || []).filter(solicitud => {
    const searchTermLower = searchTerm.toLowerCase();
    if (!searchTermLower) return true; // Si no hay término de búsqueda, mostrar todas.
    return (
      (solicitud.permiso?.nombre && solicitud.permiso.nombre.toLowerCase().includes(searchTermLower)) ||
      (solicitud.motivo && solicitud.motivo.toLowerCase().includes(searchTermLower)) ||
      (solicitud.estado?.nombre && solicitud.estado.nombre.toLowerCase().includes(searchTermLower)) ||
      (solicitud.empleado?.nombreCompleto && solicitud.empleado.nombreCompleto.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className='flex flex-col xl:flex-row justify-center w-full p-14 gap-20'>
      {/* Sección del Calendario de Eventos */}
      <div className='w-full xl:w-2/5'>
        <Events />
      </div>

      {/* Sección de Detalles de Permisos */}
      <div className='flex flex-col w-full h-full xl:w-3/5 space-y-8 overflow-y-auto dark:dark-scrollbar'>
        {/* Barra de Controles: Filtro, Búsqueda y Botón de Crear Permiso */}
        <div className='flex w-full justify-between items-center '>
          {/* Controles de Filtro - Lado Izquierdo - COMENTADO TEMPORALMENTE */}
          {/* 
          <div>
            <DropdownMenu open={isFilterDropdownOpen} onOpenChange={setIsFilterDropdownOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  // onClick manejado por onOpenChange del DropdownMenu
                >
                  Filtros <Icon name="SlidersHorizontal" className="ml-2 w-5 text-custom-orange" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-custom-gray-default dark:bg-custom-blackLight rounded-2xl"
                onCloseAutoFocus={(e) => e.preventDefault()} 
              >
                <div className="flex flex-col gap-2 p-2 w-full min-w-[20rem] max-w-[20rem]">
                  <div className="flex justify-between items-center w-full">
                    <h4 className="text-lg font-bold">
                      Datos
                    </h4>
                    <Button
                      className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full"
                      onClick={handleClearFilters}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                  <div className="flex flex-col gap-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay Filtros</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          */}

          {/* Controles de Búsqueda y Crear Permiso - Ahora ocupan todo el ancho */}
          <div className='flex items-center space-x-2 w-full'>
            {/* Campo de Búsqueda */}
            <div className="relative flex-1">
              <Icon name="Search" className="dark:text-custom-white text-custom-gray-dark w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar según Permiso"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi w-full"
              />
            </div>

            {/* Botón para Solicitar Permiso */}
            <div>
              <Button
                onClick={handleCreatePermiso}
                variant="primary"
              >
                <span className="hidden sm:inline">Solicitar Vacaciones</span>
                <Icon name="Plus" className="w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listado de Solicitudes de Permiso */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-orange mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Cargando solicitudes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button 
                onClick={fetchSolicitudes}
                className="mt-2 text-custom-orange hover:text-custom-orange/80 underline"
              >
                Reintentar
              </button>
            </div>
          ) : filteredSolicitudes && filteredSolicitudes.length > 0 ? (
            filteredSolicitudes.map((permiso) => ( 
              <VistaPermiso
                key={permiso.id}
                permiso={permiso} 
                onEdit={() => handleEditPermiso(permiso)}
                onDelete={() => handleDeletePermiso(permiso)}
                onRequestCancellation={() => handleRequestCancellation(permiso)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {searchTerm ? 'No se encontraron solicitudes que coincidan con la búsqueda.' : 'No tienes solicitudes de permiso.'}
            </p>
          )}
        </div>
      </div>

      {/* Diálogo para Crear/Actualizar Permiso */}
      <CreateUpdateDialog
        open={isOpenDialog}
        onOpenChange={(isOpen) => {
          setIsOpenDialog(isOpen);
          if (!isOpen) {
            setPermisoToEdit(null); 
          }
        }}
        permisoToEdit={permisoToEdit}
        onSuccess={refreshSolicitudes} // Agregar callback para refrescar datos
      />

      {/* Modal de Confirmación de Eliminación */}
      <DecisionModal
        variant="destructive"
        open={showDeleteModal}
        onOpenChange={(isOpen) => {
          setShowDeleteModal(isOpen);
          if (!isOpen) {
            setPermisoToDelete(null);
          }
        }}
        action={confirmDeletePermiso}
        title={
          permisoToDelete?.estado?.nombre === "Solicitado" 
            ? "¿Estás seguro de eliminar esta solicitud?"
            : "¿Estás seguro de solicitar la cancelación?"
        }
        content={
          permisoToDelete ? 
            permisoToDelete.estado?.nombre === "Solicitado" ?
              `Esta acción eliminará permanentemente la solicitud de vacaciones "${permisoToDelete.tipo_permiso_nombre || 'Vacaciones'}". Esta acción no se puede deshacer.` :
              `Esta acción solicitará la cancelación de la solicitud de vacaciones "${permisoToDelete.tipo_permiso_nombre || 'Vacaciones'}". El administrador revisará tu solicitud de cancelación.`
            :
            permisoToDelete?.estado?.nombre === "Solicitado" ?
              'Esta acción eliminará permanentemente la solicitud de vacaciones. Esta acción no se puede deshacer.' :
              'Esta acción solicitará la cancelación de la solicitud de vacaciones. El administrador revisará tu solicitud de cancelación.'
        }
        icon={
          permisoToDelete?.estado?.nombre === "Solicitado" 
            ? <Icon name="Trash2" className="text-red-500" />
            : <Icon name="Ban" className="text-red-500" />
        }
        actionText={
          permisoToDelete?.estado?.nombre === "Solicitado" 
            ? "Eliminar"
            : "Solicitar"
        }
        isLoading={isDeleting}
      />
    </div>
  )
}

export default HistoricLayout;