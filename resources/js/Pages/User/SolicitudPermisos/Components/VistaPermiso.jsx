import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

import TimelineSolicitud from '@/Pages/Admin/SolicitudPermisos/Index/Components/TimelineSolicitud'; 
import { STATUS_BADGE_COLORS } from '@/Pages/Admin/SolicitudPermisos/Index/Components/Calendar/INITIAL_PERMISOS';

import Icon from '@/imports/LucideIcon';

import { Button } from '@/Components/App/Buttons/Button'; 

const VistaPermiso = ({
  permiso, // Objeto completo del permiso
  onEdit,  // Función para manejar la edición
  onDelete, // Función para manejar la eliminación (DELETE)
  onRequestCancellation, // Función para manejar la solicitud de cancelación (POST)
}) => {
  const {
    tipo_permiso_nombre,
    estado,
    fecha_inicio,
    fecha_fin,
    motivo,
  } = permiso;

  // Formateadores de fecha y día (pueden ser importados o definidos aquí si solo se usan en este componente)
  const formatDate = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; 
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Añadido chequeo de fecha inválida
    let day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Función para obtener los colores del estado
  const getEstadoColors = (estadoNombre) => {
    const baseColor = STATUS_BADGE_COLORS[estadoNombre] || STATUS_BADGE_COLORS.default;
    
    // Mapear los colores base a todas las variaciones necesarias
    const colorMap = {
      'bg-green-500': {
        bg: 'bg-green-500/40 dark:bg-green-500/30',
        text: 'text-green-500 dark:text-green-400',
        point: 'bg-green-500 dark:bg-green-400'
      },
      'bg-red-500': {
        bg: 'bg-red-500/40 dark:bg-red-700/30',
        text: 'text-red-500 dark:text-red-400',
        point: 'bg-red-500 dark:bg-red-400'
      },
      'bg-yellow-500': {
        bg: 'bg-yellow-500/30',
        text: 'text-yellow-500',
        point: 'bg-yellow-500'
      },
      'bg-blue-500': {
        bg: 'bg-blue-500/30',
        text: 'text-blue-500 dark:text-blue-400',
        point: 'bg-blue-500 dark:bg-blue-400'
      },
      'bg-purple-500': {
        bg: 'bg-purple-500/30',
        text: 'text-purple-500',
        point: 'bg-purple-500'
      },
      'bg-gray-500': {
        bg: 'bg-gray-500/30',
        text: 'text-gray-500 dark:text-gray-400',
        point: 'bg-gray-500 dark:bg-gray-400'
      }
    };

    return colorMap[baseColor] || colorMap['bg-gray-500'];
  };

  // Determinar el estado activo actual y su posición
  const getEstadoActual = () => {
    // 'estado' aquí es el objeto estado original de permiso (permiso.estado)
    // 'permiso.seen_at' es el campo de la base de datos
    if (permiso.seen_at && estado && estado.nombre === "Solicitado") {
      return { position: 1, nombre: "En revisión" }; // Forzar "En revisión" si seen_at está y era "Solicitado"
    }

    // Si no, usar la lógica original basada en estado.nombre
    if (!estado || !estado.nombre) {
      return { position: 0, nombre: "Desconocido" };
    }

    switch (estado.nombre) {
      case "Solicitado":
        return { position: 0, nombre: estado.nombre };
      case "En revisión":
        return { position: 1, nombre: estado.nombre };
      case "A":
        return { position: 2, nombre: estado.nombre };
      case "Aprobado":
      case "Denegado":
        return { position: 3, nombre: estado.nombre };
      default:
        return { position: 0, nombre: estado.nombre };
    }
  };

  const estadoActual = getEstadoActual();

  return (
    <div className="bg-custom-gray-default dark:bg-custom-blackSemi p-4 sm:p-6 rounded-lg shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        {/* Sección izquierda (título + botones de acción) */}
        <div className="flex items-center gap-1 flex-grow">
          <div className="cursor-pointer flex-grow flex" onClick={toggleExpand}>
            <h2 className="text-custom-blue dark:text-custom-white font-bold text-lg sm:text-xl leading-tight">
              {tipo_permiso_nombre || permiso.permiso?.nombre}
            </h2>
            
          {/* Dropdown de acciones */}
          {(onEdit || onDelete || onRequestCancellation) && (
            (estadoActual.nombre === "Solicitado" || estadoActual.nombre === "En revisión" || estadoActual.nombre === "En proceso") && (
              <div className="flex items-center gap-1 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="btn h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                      <Icon name="Ellipsis" className="w-4 h-4 mb-2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-custom-blackSemi" side="bottom" align="end">
                    {estadoActual.nombre === "Solicitado" && onEdit && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.stopPropagation();
                          onEdit(permiso);
                        }}
                      >
                        <Icon name="SquarePen" className="w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                    )}
                    
                    {estadoActual.nombre === "Solicitado" && onDelete && (
                      <DropdownMenuItem
                        className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                        onSelect={(e) => {
                          e.stopPropagation();
                          onDelete(permiso);
                        }}
                      >
                        <Icon name="X" className="w-4 mr-2" /> Eliminar solicitud
                      </DropdownMenuItem>
                    )}

                    {(estadoActual.nombre === "En revisión" || estadoActual.nombre === "En proceso") && onRequestCancellation && (
                      <DropdownMenuItem
                        className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                        onSelect={(e) => {
                          e.stopPropagation();
                          onRequestCancellation(permiso);
                        }}
                      >
                        <Icon name="X" className="w-4 mr-2" /> Solicitar cancelación
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          )}
          </div>

        </div>

        {/* Sección derecha (badges + icono expandir) */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Badge del estado usando colores centralizados */}
          {(() => {
            const colors = getEstadoColors(estadoActual.nombre);
            return (
              <span className={`${colors.bg} ${colors.text} text-xs sm:text-sm px-2 py-1 rounded-full flex items-center gap-1 sm:gap-2 font-bold`}>
                <div className={`w-2 h-2 ${colors.point} rounded-full`}></div>
                <span>{estadoActual.nombre}</span>
              </span>
            );
          })()}
          <button 
            onClick={toggleExpand} 
            className="text-gray-500 dark:text-custom-white p-1"
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <Icon name="ChevronUp" size={18} className="sm:w-5 sm:h-5" /> : <Icon name="ChevronDown" size={18} className="sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Fechas */}
      <div className="mt-3 sm:mt-2">
        {/* Layout móvil: fechas apiladas verticalmente */}
        <div className="flex flex-col gap-1 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-custom-blue dark:text-custom-white text-xs font-medium">
                {getDayOfWeek(fecha_inicio)}
              </div>
              <div className="text-custom-blue dark:text-custom-white font-bold text-sm">
                {formatDate(fecha_inicio)}
              </div>
            </div>
            <div className="text-custom-orange px-2">
              <Icon name="ArrowRight" className="w-2.5 h-2.5" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-custom-blue dark:text-custom-white text-xs font-medium">
                {getDayOfWeek(fecha_fin)}
              </div>
              <div className="text-custom-blue dark:text-custom-white font-bold text-sm">
                {formatDate(fecha_fin)}
              </div>
            </div>
          </div>
        </div>

        {/* Layout desktop: fechas horizontales */}
        <div className="hidden sm:flex sm:items-center gap-3">
          {/* Fecha inicio */}
          <div className="flex-1">
            <div className="text-custom-blue dark:text-custom-white text-sm font-medium">
              {getDayOfWeek(fecha_inicio)}
            </div>
            <div className="text-custom-blue dark:text-custom-white font-bold text-lg">
              {formatDate(fecha_inicio)}
            </div>
          </div>

          {/* Flecha separadora */}
          <div className="text-custom-orange flex items-center justify-center px-2">
            <Icon name="ArrowRight" className="text-custom-orange w-5 h-5" />
          </div>

          {/* Fecha fin */}
          <div className="flex-1">
            <div className="text-custom-blue dark:text-custom-white text-sm font-medium">
              {getDayOfWeek(fecha_fin)}
            </div>
            <div className="text-custom-blue dark:text-custom-white font-bold text-lg">
              {formatDate(fecha_fin)}
            </div>
          </div>
        </div>
      </div>

      {/* Expandir contenido */}
      {isExpanded && (
        <>
          <hr className="border-custom-gray-semiLight dark:border-custom-gray-darker my-4" />

          {/* Descripción */}
          {motivo && (
            <div className="mb-4">
              <h4 className="text-custom-blue dark:text-custom-white font-medium text-sm mb-2">
                Motivo:
              </h4>
              <p className="text-gray-500 dark:text-custom-gray-semiLight text-sm leading-relaxed">
                {motivo}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-4">
            <TimelineSolicitud permiso={permiso} />
          </div>
        </>
      )}
    </div>
  );
};

export default VistaPermiso;