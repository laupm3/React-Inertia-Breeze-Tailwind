import { useState, useEffect } from 'react';

import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/App/Buttons/Button";

import { useView } from '../../Context/ViewContext'; 
import { useSolicitudDetails } from '../../Hooks/useSolicitudDetails';

import TimelineSolicitud from '../TimelineSolicitud'; 
import EmpleadoSheetTable from '@/Components/App/Empleado/SheetTable/SheetTable';
import FileUploadArea from "@/Components/App/FileUpload/FileUploadArea";
import Pill from "@/Components/App/Pills/Pill";
import VACACIONES_COLOR_MAP from "@/Components/App/Pills/constants/VacacionesMapColor";

import Icon from '@/imports/LucideIcon';
import ApprovalActionsFooter from '../ApprovalActionsFooter';


// Funciones de ayuda para formatear fecha y hora (pueden moverse a un archivo de utilidades)
const getFormattedDate = (dateString) => {
    if (!dateString) return "Fecha no proporcionada";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
};
// Formato de hora en 24 horas
const getFormattedTime = (dateString) => {
    if (!dateString) return "Hora no proporcionada";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Hora inválida";
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Nueva función para obtener el nombre del estado a mostrar en el badge
const getDisplayEstadoNombre = (permiso) => {
    if (!permiso || !permiso.estado || !permiso.estado.nombre) return "Estado desconocido";

    const { estado, seen_at } = permiso;

    if (seen_at && estado.nombre === "Solicitado") {
        // Ejemplo: Si está solicitado y visto, podrías querer mostrar "Visto" o "Solicitado (Visto)"
        // return "Visto"; // O ajusta según la lógica de negocio deseada
    }
    return estado.nombre;
};

export const EventClickDialog = ({ isOpen, onClose, eventData = null }) => {
  const { handleSheetView } = useView(); 
  const [isEmployeeSheetOpen, setIsEmployeeSheetOpen] = useState(false);
  
  // Hook especializado para manejo de detalles de solicitud
  const {
    isLoading: isLoadingDetails,
    error: detailsError,
    details: solicitudCompleta,
    fetchSolicitudDetails,
    clearDetails,
    getCachedDetails
  } = useSolicitudDetails();

  // Cargar detalles completos cuando se abre el diálogo
  useEffect(() => {
    if (!isOpen || !eventData) {
      clearDetails();
      return;
    }

    const solicitudId = eventData.extendedProps?.permisoCompleto?.id || eventData.id;
    
    if (!solicitudId) {
      return;
    }

    // Verificar cache primero
    const cachedDetails = getCachedDetails(solicitudId);
    if (cachedDetails) {
      return;
    }

    // SIEMPRE cargar desde API .show para obtener datos completos con archivos
    fetchSolicitudDetails(solicitudId);
  }, [isOpen, eventData, fetchSolicitudDetails, clearDetails, getCachedDetails]);

  if (!isOpen || !eventData) return null;

  const { title, start, end, extendedProps, backgroundColor } = eventData;
  
  // Determinar qué datos usar (prioridad: solicitudCompleta > eventData completo > eventData básico)
  const permisoCompleto = solicitudCompleta || 
                         (extendedProps?.permisoCompleto?.files !== undefined ? extendedProps.permisoCompleto : null);
  const permisoBasico = extendedProps?.permisoCompleto || null;
  const permisoParaUsar = permisoCompleto || permisoBasico;

  
  // Datos del empleado
  const empleadoSolicitante = permisoParaUsar?.empleado;
  const empleadoNombre = empleadoSolicitante?.nombreCompleto || extendedProps?.empleadoNombre || "Nombre no disponible";
  const empleadoPuesto = empleadoSolicitante?.tipoEmpleado?.nombre || "Puesto no disponible"; 
  const avatarUrl = empleadoSolicitante?.user?.profile_photo_url || 
                   (typeof extendedProps?.description === 'string' && extendedProps.description.startsWith('http') 
                    ? extendedProps.description : null);

  // Estado de la solicitud
  const displayEstadoNombre = permisoParaUsar ? getDisplayEstadoNombre(permisoParaUsar) : "Desconocido";

  // Estados de carga y error
  const isLoadingAnyData = isLoadingDetails;
  const hasError = detailsError !== null;

  //Función para manejar el clic en "Ver información" del empleado
  const handleViewEmployeeInfo = () => {
    if (empleadoSolicitante?.id) {
      setIsEmployeeSheetOpen(true);
    }
  };

  return (
    <>
      <DialogBase 
        open={isOpen} 
        onOpenChange={(openState) => {
            if (!openState) {
                onClose();
            }
        }}
    >
        <DialogContent className="bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-white w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                    <DialogTitle className="text-lg font-medium">Resumen de la solicitud de permiso</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Aquí se muestran los detalles de la solicitud de permiso, incluyendo el estado y la línea de tiempo.
                    </DialogDescription>
                </div>
            </DialogHeader>
            
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-custom-gray-default dark:bg-custom-blackLight">
                {/* Indicador de carga */}
                {isLoadingAnyData && (
                    <div className="flex items-center justify-center py-4">
                        <Icon name="MoreHorizontal" className="animate-spin h-5 w-5 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cargando detalles completos...</span>
                    </div>
                )}

                {/* Mensaje de error */}
                {hasError && !isLoadingAnyData && (
                    <div className="flex items-center justify-center py-4 text-yellow-600 dark:text-yellow-400">
                        <Icon name="AlertTriangle" className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                            {detailsError || "No se pudieron cargar todos los detalles. Mostrando información básica."}
                        </span>
                    </div>
                )}

                {/* Sección de Información del Empleado */}
                <div className="p-3 md:p-4 bg-white dark:bg-custom-blackSemi rounded-lg shadow">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Empleado que solicita el permiso</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={empleadoNombre} className="h-10 w-10 rounded-full mr-3 object-cover" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3 flex items-center justify-center text-white">
                                    <Icon name="User" size={20} />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{empleadoNombre}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{empleadoPuesto}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs dark:text-gray-300 dark:border-gray-600 hover:dark:bg-gray-700"
                            onClick={handleViewEmployeeInfo}
                        >
                            Ver información <Icon name="ExternalLink" size={12} className="ml-1.5" />
                        </Button>
                    </div>
                </div>

                

                {/* Sección de Línea de Tiempo y Sección de Estado Actual */}
                <div className="p-3 md:p-4 bg-white dark:bg-custom-blackSemi rounded-lg shadow">
                    {/* Sección de Estado Actual */} 
                {permisoParaUsar && (
                    <div className="flex p-3 md:p-4 bg-white dark:bg-custom-blackSemi rounded-lg shadow">
                        <h3 className="text-sm mt-1 font-semibold mb-2 text-gray-700 dark:text-gray-300">Estado Actual del Permiso: </h3>
                        <div className="flex ml-2 items-center gap-2">
                            {displayEstadoNombre === "Aprobado" && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="Check" size={12} />
                                    <span>Aprobado</span>
                                </span>
                            )}
                            {displayEstadoNombre === "Denegado" && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="XCircle" size={12} />
                                    <span>Denegado</span>
                                </span>
                            )}
                            {displayEstadoNombre === "En revisión" && (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="Info" size={12} />
                                    <span>En revisión</span>
                                </span>
                            )}
                            {displayEstadoNombre === "Solicitado" && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="Send" size={12} />
                                    <span>Solicitado</span>
                                </span>
                            )}
                            {displayEstadoNombre === "En proceso" && (
                                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="MoreHorizontal" size={12} className="animate-spin" />
                                    <span>En proceso</span>
                                </span>
                            )}
                            {/* Fallback para otros estados o si es "Desconocido" */}
                            {!["Aprobado", "Denegado", "En revisión", "Solicitado", "En proceso"].includes(displayEstadoNombre) && displayEstadoNombre !== "Desconocido" && (
                                <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="HelpCircle" size={12} />
                                    <span>{displayEstadoNombre}</span>
                                </span>
                            )}
                            {displayEstadoNombre === "Desconocido" && (
                                <span className="bg-gray-400 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Icon name="AlertTriangle" size={12} />
                                    <span>Desconocido</span>
                                </span>
                            )}
                        </div>
                    </div>
                )}
                 {/* Sección de Timeline */} 
                    {permisoParaUsar && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Línea de Tiempo:</h4>
                            <TimelineSolicitud permiso={permisoParaUsar} />
                        </div>
                    )}
                    {!permisoParaUsar &&
                        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                            Nota: El seguimiento detallado requiere datos completos del permiso.
                        </p>
                    }
                </div>

                {/* Sección de Fecha y Tipo de Permiso */}
                <div className="p-3 md:p-4 bg-white dark:bg-custom-blackSemi rounded-lg shadow ">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Fecha de permiso</h3>
                    <div className="items-center gap-x-3 gap-y-2 text-xs flex">
                        <Icon name="CalendarDays" className="text-orange-500" size={16}/>
                        <span className="text-gray-700 dark:text-gray-300">{getFormattedDate(start)}</span>
                        <Icon name="Clock" className="text-orange-500 ml-2 md:ml-0" size={16}/>
                        <span className="text-gray-700 dark:text-gray-300">{getFormattedTime(start)}</span>
                        
                        <Icon name="ArrowRight" className="text-orange-500 hidden md:block place-self-center" size={16}/>
                        <div className="col-span-full md:hidden border-t my-1 dark:border-gray-700"></div>


                        <Icon name="CalendarDays" className="text-orange-500" size={16}/>
                        <span className="text-gray-700 dark:text-gray-300">{getFormattedDate(end)}</span>
                        <Icon name="Clock" className="text-orange-500 ml-2 md:ml-0" size={16}/>
                        <span className="text-gray-700 dark:text-gray-300">{getFormattedTime(end)}</span>
                    </div>
                    
                    {/* Sección de Tipo de Permiso */}
                    <h3 className="text-sm font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">Permiso solicitado</h3>
                    <Pill 
                        identifier={title || "No especificado"}
                        mapColor={VACACIONES_COLOR_MAP}
                        size="sm"
                    >
                        {title || "No especificado"}
                    </Pill>

                    {(permisoCompleto || permisoBasico)?.motivo && (
                        <>
                            <h3 className="text-sm font-semibold mt-4 mb-1 text-gray-700 dark:text-gray-300">Motivo</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{permisoParaUsar?.motivo}</p>
                        </>
                    )}
                    
                    {/* Sección de Archivos */}
                    {(permisoCompleto || (!isLoadingAnyData && permisoBasico)) && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Documentos adjuntos</h3>
                            {permisoCompleto?.files && permisoCompleto.files.length > 0 ? (
                                <FileUploadArea
                                    id="file-display-only"
                                    existingFiles={permisoCompleto.files}
                                    selectedFiles={[]}
                                    onFileChange={() => {}} // Sin funcionalidad
                                    onRemoveExisting={null} // Solo visualización
                                    showExistingFiles={true}
                                    allowRemoveExisting={false} // Solo lectura
                                    disabled={true} // Deshabilitar drag & drop
                                    showPreview={true}
                                    className="opacity-90" // Ligera transparencia para indicar que es solo lectura
                                    text="Archivos adjuntos a esta solicitud"
                                    downloadConfig={{
                                        endpoint: '/api/v1/files/{file}/download',
                                        fileIdField: 'hash',
                                        fileNameField: 'name'
                                    }}
                                />
                            ) : isLoadingAnyData ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <Icon name="MoreHorizontal" className="animate-spin h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Cargando archivos adjuntos...</p>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                        {permisoParaUsar?.files_count > 0 
                                            ? `Hay ${permisoParaUsar.files_count} archivo(s) adjunto(s), pero no se pudieron cargar`
                                            : "No hay documentos adjuntos a esta solicitud"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ApprovalActionsFooter 
                solicitud={permisoParaUsar} 
                onClose={onClose}
            />
        </DialogContent>
      </DialogBase>

      {/* Sheet lateral para mostrar información del empleado */}
      {empleadoSolicitante?.id && (
          <EmpleadoSheetTable
              open={isEmployeeSheetOpen}
              onOpenChange={setIsEmployeeSheetOpen}
              model={empleadoSolicitante.id}
              enableToView={true}
          />
      )}
    </>
  );
};